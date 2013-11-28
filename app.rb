#!/usr/bin/env ruby
require 'optparse'

VERSION = '0.0.1'
ARTHOR = 'Bachue'

options = { env: :development }
OptionParser.new do |opts|
  opts.banner = "Usage: #{$0} [options]"

  opts.on('-e', '--environment ENVIRONMENT', 'Specify the environment Garm will run in') do |env|
    if ['test', 'development', 'production'].include?(env.downcase)
      options[:env] = env.downcase.to_sym
    else
      $stderr.puts 'Garm can run in development, production or test environment'
      exit -1
    end
  end

  opts.on('-v', '--version', 'Show version') do
    puts "Garm #{VERSION} developed by #{ARTHOR}"
    exit
  end
end.parse!

require 'bundler'

Bundler.require :default, options[:env]

set :database, 'sqlite3:///development.sqlite3'

get '/' do
  'Hello world !'
end
