require 'sinatra/activerecord/rake'
require_relative 'app'

desc 'Start console'
task :console, [:environment] do |t, args|
  environments = "ENV=#{args.environment}" if args.environment
  Kernel.exec "#{environments} irb -I:#{File.dirname(__FILE__)} -rapp"
end

task :db, [:environment] do |t, args|
  args.with_defaults(:environment => 'development')
  case args.environment
  when 'development', 'test'
    Kernel.exec "sqlite3 -line #{File.dirname(__FILE__)}/db/#{args.environment}.sqlite3"
  when 'production'
    raise 'Not Implemented'
  else
    raise "Unknown environment: #{args.environment.inspect}"
  end
end
