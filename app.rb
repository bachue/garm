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
  set :database, "sqlite3:///db/#{settings.environment}.sqlite3"
end

get '/projects/_subscriptions' do
  projects = Project.select([:id, :name]).includes :subscriptions
  json projects.as_json(include: {subscriptions: {only: [:id, :email, :interval_days]}})
end

get '/projects/_exceptions' do
  json ProjectQuickLoader.load(10, 10)
end

post '/projects/_run_commands' do
  error 400 if params['commands'].blank?
  commands = JSON.load(params['commands'])
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