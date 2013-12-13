#!/usr/bin/env ruby
require_relative 'env'
require_relative 'models'
require_relative 'services'
require_relative 'helpers'

include Garm::Model
include Garm::Service

require 'sinatra/json'

configure do
  enable :logging
end

configure :development, :test do
  enable :lock
  set :database, "sqlite3:///db/#{settings.environment}.sqlite3"
end

get '/projects/_subscriptions' do
  projects = Project.select([:id, :name]).includes :subscriptions
  projects.each {|project| project.percent = ProjectQuickLoader.resolved_percent project }

  json projects.as_json(methods: :percent, include: {subscriptions: {only: [:id, :email, :interval_days]}})
end

get '/projects/_exceptions' do
  json ProjectQuickLoader.load(:all, :all)
end

post '/projects/_run_commands' do
  error 400 if params['commands'].blank?
  commands = Yajl.load(params['commands'])
  new_project_list, new_subscription_list = {}, Hash.new {|h, k| h[k] = {} }

  Project.transaction do
    commands.each do |command|
      case command['cmd']
      when 'add_project'
        project = Project.new name: command['project_name']
        if project.save
          new_project_list[project.name] = project.id
        else
          rollback 400, "Failed to create project: #{project.errors.full_messages}"
        end
      when 'edit_project'
        project = Project.find command['project_id'] rescue rollback(400)
        unless project.update name: command['project_name']
          rollback 400, "Failed to update project: #{project.errors.full_messages}"
        end
      when 'del_project'
        Project.find(command['project_id']).destroy rescue rollback(400)
      when 'add_subscription'
        if command['project_id']
          project = Project.find command['project_id'] rescue rollback(400)
        elsif command['project_name']
          project = Project.find_by name: command['project_name']
        end
        rollback 400 unless project

        subscription = project.subscriptions.build command['subscription'].slice('email', 'interval_days')
        if subscription.save
          new_subscription_list[project.id][subscription.email] = subscription.id
        else
          rollback 400, "Failed to create subscription: #{subscription.errors.full_messages}"
        end
      when 'edit_subscription'
        subscription = SummarySubscription.find command['subscription']['id'] rescue rollback(400)
        unless subscription.update command['subscription'].slice('email', 'interval_days')
          rollback 400, "Failed to update subscription: #{subscription.errors.full_messages}"
        end
      when 'del_subscription'
        SummarySubscription.find(command['subscription_id']).destroy rescue rollback(400)
      else
        rollback 400, "Command not found: #{command['cmd']}"
      end
    end
  end
  json new_projects: new_project_list, new_subscriptions: new_subscription_list if status == 200
end

post '/projects/:project/exception_categories/:category_id' do
  error 400 if params['project'].blank? || params['category_id'].blank?

  project = Project.find_by name: params['project']
  error 400 unless project
  category = project.exception_categories.find_by id: params['category_id']
  error 400 unless category

  if params['resolved']
    category.update resolved: params['resolved'] == 'true'
    ProjectQuickLoader.resolved_percent(project).to_s
  elsif params['comment']
    category.update comment: params['comment']
  else # TODO: Support important & wont_fix in the future
    error 400
  end
end

get '/projects/_flush' do
  error 400 if params['d'].blank?
  data = Yajl.load params['d']

  result = data.inject(Hash.new {|h, k| h[k] = {}}) do |h, (project_name, category_hash)|
    project = Project.find_by name: project_name
    error 400 unless project

    latest_time = category_hash.values.map(&:to_i).max
    new_categories = ExceptionCategoryQuickLoader.load project, :all, :all, 'first_seen_on > ?', latest_time

    old_categories = category_hash.inject({}) do |h, (category_id, latest_time)|
      category = project.exception_categories.find_by id: category_id
      error 400 unless category

      new_exceptions = ExceptionQuickLoader.load category, :all, 'time_utc > ?', latest_time.to_i
      next h if new_exceptions.empty?
      h[category.id] = {
        exceptions: new_exceptions,
        exception_size: ExceptionQuickLoader.count(category),
        frequence: category.frequence,
        version_distribution: category.occurrence_count_version_distribution,
        date_distribution: category.occurrence_count_date_distribution
      }
      h
    end

    h[project_name][:new] = new_categories if new_categories.present?
    h[project_name][:old] = old_categories if old_categories.present?
    h
  end

  json result
end

get '/projects/:project_name/_search' do
  return json [] if params['q'].blank?
  error 400 if params['project_name'].blank?

  project = Project.find_by name: params['project_name']
  error 400 unless project

  keywords = params['q'].split ' '
  where = keywords.map {|keyword| "lower(queries.text) like lower('%#{keyword}%')"}.join(' and ')

  exception_category_fields = [:exception_type, :message, :comment].map {|field| "ifnull(exception_categories.#{field}, '')" }
  exception_fields = [:svr_host, :svr_ip, :description, :version].map {|field| "ifnull(exceptions.#{field}, '')" }
  exception_fields << "datetime(exceptions.time_utc, 'unixepoch')"
  fields = ['exception_categories.exception_type AS type', 'exceptions.time_utc AS time', 'exception_categories.resolved AS r',
            'exceptions.id AS e_id', 'exception_categories.id AS c_id',
            (exception_category_fields + exception_fields).join('||" "||') + ' AS text']

  subquery = project.exception_categories.joins(:exceptions).select(fields)
  arel = Arel::SelectManager.new Project.arel_table.engine
  arel.project '*'
  arel.from subquery.as('queries')
  arel.where Arel.sql(where)
  results = Project.find_by_sql([arel.to_sql, project.id]).map do |r|
    {exception_type: r.type, time_utc: r.time, category_id: r.c_id, exception_id: r.e_id, resolved: r.r}
  end
  json results
end

post '/api/exceptions' do
  data = Yajl.load params['e']

  ExceptionCategory.transaction do
    rollback 400, 'parameter sha1 is required' if data['sha1'].blank?
    rollback 400, 'parameter project is required' if data['project'].blank?

    project = Project.find_by name: data['project']
    rollback 400, "Failed to find project #{data['project']}" unless project

    category = project.exception_categories.find_by key: data['sha1']

    unless category
      category = project.exception_categories.build data.slice('exception_type', 'message', 'important')
      category.key           = data['sha1']
      category.first_seen_on = data['time_utc']
      category.first_seen_in = data['version'] if data['version']
      unless category.save
        rollback 400, "Failed to create exception category: #{category.errors.full_messages}"
      end
    end

    exception = category.exceptions.build data.slice('time_utc', 'svr_host', 'svr_ip', 'svr_zone', 'pid',
      'version', 'backtrace', 'uuid', 'tag', 'position', 'description', 'summaries', 'ext')
    unless exception.save
      rollback 400, "Failed to create exception: #{exception.errors.full_messages}"
    end
  end
end

post '/api/logs' do
  data = Yajl.load params['l']

  Log.transaction do
    rollback 400, 'parameter log is required'      if data['log'].blank?
    rollback 400, 'parameter time_utc is required' if data['time_utc'].blank?
    rollback 400, 'parameter project is required'  if data['project'].blank?

    project = Project.find_by name: data['project']
    rollback 400, "Failed to find project #{data['project']}" unless project

    data['log'].match /(.*?)\s*<<([\w-]+)>>\s*(.*)/

    log = project.logs.build uuid: $2, log: "#{$1}#{$3}", time_utc: data['time_utc']
    unless log.save
      rollback 400, "Failed to create log: #{log.errors.full_messages}"
    end
  end
end

get '/js/env.js' do
  content_type 'text/javascript'
  $jsenv ||= case
             when settings.cdn?
               'cdn'
             when settings.production?
               'internal'
             else
               'dev'
             end
  "env = '#{$jsenv}';"
end

get '/' do
  send_file File.join(File.dirname(__FILE__), 'public', 'index.html')
end

get '/exceptions/*' do
  redirect to('#/exceptions/' + params[:splat][0])
end
