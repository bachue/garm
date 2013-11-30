#!/usr/bin/env ruby
require 'sinatra/json'

require_relative 'env'
require_relative 'models'

if $options.env.development?
  set :database, 'sqlite3:///db/development.sqlite3'
end

post '/projects/run_commands' do
  return status 400 if params['commands'].blank?
  commands = JSON.load(params['commands'])
  new_project_list, new_subscription_list = {}, {}

  Project.transaction do
    commands.each do |command|
      case command['cmd']
      when 'add_project'
        project = Project.new name: command['project_name']
        if project.save
          new_project_list[project.name] = project.id
        else
          status 400 and raise ActiveRecord::Rollback
        end
      when 'edit_project'
        project = Project.find command['project_id'] rescue status 400 and raise ActiveRecord::Rollback
        project.update name: command['project_name']
        status 400 and raise ActiveRecord::Rollback unless project.save
      when 'del_project'
        project = Project.find command['project_id'] rescue status 400 and raise ActiveRecord::Rollback
        status 400 and raise ActiveRecord::Rollback unless project.destroy
      when 'add_subscription'
      when 'edit_subscription'
      when 'del_subscription'
      else
        status 400 and raise ActiveRecord::Rollback
      end
    end
  end
  json new_projects: new_project_list, new_subscriptions: new_subscription_list if status == 200
end

get '/js/env.js' do
  content_type 'text/javascript'
  $jsenv ||= case
             when $options.cdn
               'cdn'
             when $options.production?
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