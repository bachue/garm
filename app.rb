#!/usr/bin/env ruby
require_relative 'env'

if $options.env.development?
  set :database, 'sqlite3:///db/development.sqlite3'
end

get '/' do
  'Hello world !'
end
