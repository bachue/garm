require 'optparse'
require 'ostruct'
require 'sinatra'

VERSION = '0.0.1'
ARTHOR = 'Bachue'

settings.disable :cdn

settings.environment = ENV['ENV'] if ENV['ENV']

OptionParser.new do |opts|
  opts.banner = "Usage: #{$0} [options]"

  opts.on('-e', '--environment ENVIRONMENT', 'Specify the environment Garm will run in') do |env|
    if ['test', 'development', 'production'].include?(env.downcase)
      settings.set :environment, env.downcase.to_sym
    else
      $stderr.puts 'Garm can run in development, production or test environment'
      exit(-1)
    end
  end

  opts.on('--cdn', 'Load JS files from CDN') do
    settings.enable :cdn
  end

  opts.on('--no-cdn', 'Not to load JS files from CDN') do
    settings.disable :cdn
  end

  opts.on('-v', '--version', 'Show version') do
    puts "Garm #{VERSION} developed by #{ARTHOR}"
    exit
  end
end.parse!

require 'bundler'

Bundler.require :default, settings.environment
