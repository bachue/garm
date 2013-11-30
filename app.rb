#!/usr/bin/env ruby
require 'sinatra/json'

require_relative 'env'
require_relative 'models'
require_relative 'helpers'

enable :logging

if $options.env.development?
  set :database, 'sqlite3:///db/development.sqlite3'
end

post '/projects/run_commands' do
  error 400 if params['commands'].blank?
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
          rollback 400, "Failed to create project: #{project.errors.full_messages}"
        end
      when 'edit_project'
        project = Project.find command['project_id'] rescue rollback(400)
        project.update name: command['project_name']
        rollback 400, "Failed to update project: #{project.errors.full_messages}"
      when 'del_project'
        project = Project.find command['project_id'] rescue rollback(400)
        project.destroy
      when 'add_subscription'
      when 'edit_subscription'
      when 'del_subscription'
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