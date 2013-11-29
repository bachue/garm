#!/usr/bin/env ruby
require_relative 'env'

if $options.env.development?
  set :database, 'sqlite3:///db/development.sqlite3'
end

get '/' do
  send_file File.join(File.dirname(__FILE__), 'public', 'index.html')
end

get '/exceptions/*' do
  redirect to('#/exceptions/' + params[:splat][0])
end