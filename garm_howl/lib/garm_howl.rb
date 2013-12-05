require 'garm_howl/version'
require 'socket'
require 'pathname'
require 'yaml'

module Garm
  extend self

  attr_accessor :project, :hostname, :ip_addr, :timezone, :pid, :version, :config_path

  def howl *args
    message = build_message build_params(args)
    send_message message
  end

  private
    def init_variables
      @hostname ||= Socket.gethostname
      @ip_addr  ||= IPSocket.getaddress(@hostname)
      @timezone ||= Time.now.strftime('%:z')
      @pid      ||= Process.pid
      @version  ||= get_version || :unknown
    end

    def get_version
      if defined?(Rails)
        choices = [Rails.root.join('public')]
      elsif defined?(Sinatra)
        choices = [File.join(Sinatra::Base.settings.root || '.', 'public'),
                   File.join(Sinatra::Base.settings.public_folder || '.')]
      else
        choices = ['public', '.']
      end

      filenames = ['version', 'version.txt']

      choices.each do |choice|
        filenames.each do |filename|
          path = Pathname.new "#{choice}/#{filename}"
          return path.read if path.exist?
        end
      end
    end

    def get_config_path
      return @config_path if @config_path
      return Sinatra::Base.settings.garm_config if defined?(Sinatra) && Sinatra::Base.settings.garm_config

      if defined?(Rails)
        choices = [Rails.root.join('config')]
      elsif defined?(Sinatra)
        choices = [File.join(Sinatra::Base.settings.root || '.'),
                   File.join(Sinatra::Base.settings.root || '.', 'config')]
      else
        choices = ['config', '.']
      end

      filenames = ['garm.yml', 'garm.yaml']

      choices.each do |choice|
        filenames.each do |filename|
          path = Pathname.new "#{choice}/#{filename}"
          return path if path.exist?
        end
      end
    end

    def get_config path = get_config_path
      raise ArgumentError.new "Config file #{path} not exists" unless File.exist?(path)
      content = YAML.load_file path

      if defined?(Rails)
        content = content[Rails.env]
      elsif defined?(Sinatra)
        content = content[Sinatra::Base.settings.environment.to_s]
      end

      content
    end

    def get_instance_variables env
      env.instance_variables.inject({}) do |h, k|
        h[k] = env.instance_variable_get k
        h
      end
    end

    def get_class_variables env
      cls = env.is_a?(Class) ? env : env.class
      cls.class_variables.inject({}) do |h, k|
        h[k] = cls.class_variable_get k
        h
      end
    end

    def extract_options! args
      options = args.last.is_a?(Hash) ? args.pop : {}

      error = args.detect {|arg| arg.is_a?(Exception) }
      args.delete error

      request = defined?(Rack::Request) args.detect {|arg| arg.is_a?(Rack::Request) }
      args.delete request

      context = args.first # Believe the only rest one is context

      [error, context, request, options]
    end

    def stringify_hash hash
      Hash[hash.map {|k, v| [k, v.inspect]}]
    end

    def build_params args
      error, context, request, options = extract_options! args

      error ||= $!
      context ||= options[:context]
      request ||= options[:request]

      [error, context, request, options]
    end

    def build_message error, context, request, options
      raise ArgumentError.new 'Please give me an exception' unless error.is_a?(Exception)
      raise InitialzeError.new 'Please set current project name which you registered in Garm server' unless @project

      init_variables

      message = {
        :project => @project,
        :exception_type => error.class.name,
        :message => error.message,
        :backtrace => error.backtrace,
        :time_utc => Time.now.utc.to_i,
        :svr_host => @hostname,
        :svr_zone => @timezone,
        :pid => @pid,
        :version => @version unless @version == :unknown,
        :important => !!opts[:important],
        :tag => opts['tag'],
        :position => opts[:position] || error.backtrace.first,
        :description => opts[:description],
        :summaries => opts[:summaries] || {},
        :ext => {'Environment' => ENV}.merge(opts[:ext] || {})
      }

      if context
        message[:ext].merge({
          'Instance Variables' => stringify_hash(get_instance_variables(opts[:context])),
          'Class Variables' => stringify_hash(get_class_variables(opts[:context]))
        })
      end

      if request
        message[:ext].merge({
          'Request' => stringify_hash(request.env),
          'Parameters' => request.params,
          'Session' => stringify_hash(request.session),
          'Cookies' => request.cookies
        })
        message[:summaries].merge({
          'Method' => request.env['REQUEST_METHOD'],
          'URL' => request.env['REQUEST_URI'],
          'Server Port' => request.env['SERVER_PORT']
        })

        if defined?(Rails)
          message[:summaries].merge({
            'Controller' => request.params['controller'],
            'Action' => request.params['action']
          })
          message[:description] ||= "A #{error.class.name} occurred in #{request.params['controller']}##{request.params['action']}"
        elsif defined?(Sinatra)
          message[:summaries].merge({
            'Route' => request.env['sinatra.route']
          })
          message[:description] ||= "A #{error.class.name} occurred in #{request.env['sinatra.route']}"
        end
      end

      message
    end

    def send_message message
      data = MultiJson.dump message
    end

    InitialzeError = Class.new StandardError
end
