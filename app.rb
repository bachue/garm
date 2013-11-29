#!/usr/bin/env ruby
require_relative 'env'

if $options.env.development?
  set :database, 'sqlite3:///db/development.sqlite3'
end

post '/projects/run_commands' do
  params.inspect
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