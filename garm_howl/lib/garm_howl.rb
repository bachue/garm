require 'garm_howl/version'
require 'socket'
require 'pathname'
require 'yaml'
require 'uri'
require 'net/http'
require 'garm_howl/core_ext/logger'

module Garm
  attr_accessor :project, :hostname, :ip_addr, :timezone, :pid, :version, :config_path

  def howl *args
    message = build_exception_message(*build_params(args))
    send_message message, '/api/exceptions', 'e'
  end

  def log log
    data = {:log => log}
    send_message data, '/api/logs', 'l'
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
      filenames = ['version', 'version.txt']

      possible_version_paths.each do |dir|
        filenames.each do |filename|
          path = Pathname.new "#{dir}/#{filename}"
          return path.read if path.exist?
        end
      end

      nil
    end

    def get_config_path
      return @config_path if @config_path
      return Sinatra::Base.settings.garm_config if defined?(Sinatra) && Sinatra::Base.settings.garm_config

      filenames = ['garm.yml', 'garm.yaml']

      possible_config_paths.each do |dir|
        filenames.each do |filename|
          path = Pathname.new "#{dir}/#{filename}"
          return path if path.exist?
        end
      end

      raise 'No config file for Garm'
    end

    # Example for config (for Rails)
    # development:
    #   url: http://localhost:3000
    # test:
    #   url: http://staging.garm
    # production:
    #   url: http://garm

    def get_config path = get_config_path
      raise ArgumentError.new "Config file #{path} not exists" unless File.exist?(path)
      parse_config YAML.load_file(path)
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

      request = args.detect {|arg| arg.is_a?(Rack::Request) } if defined?(Rack::Request)
      args.delete request if request

      context = args.first # Believe the only rest one is context

      [error, context, request, options]
    end

    def build_params args
      error, context, request, options = extract_options! args

      error ||= $!
      context ||= options[:context]
      request ||= options[:request]

      [error, context, request, options]
    end

    def build_exception_message error, context, request, options
      raise ArgumentError.new 'Please give me an exception' unless error.is_a?(Exception)

      project = options[:project] || @project
      raise InitialzeError.new 'Please set current project name which you registered in Garm server' unless project

      init_variables

      message = {
        :project => project,
        :exception_type => error.class.name,
        :message => error.message,
        :backtrace => error.backtrace.join("\n"),
        :sha1 => sha1(error.class.name, error.message, error.backtrace),
        :time_utc => Time.now.utc.to_i,
        :svr_host => @hostname,
        :svr_zone => @timezone,
        :svr_ip => @ip_addr,
        :pid => @pid,
        :position => options[:position] || error.backtrace.first,
        :summaries => options[:summaries] || {},
        :ext => {'Environment' => ENV.to_hash}.merge(options[:ext] || {})
      }

      message[:version] = @version unless @version == :unknown
      message[:important] = true if options[:important]
      message[:tag] = options[:tag] if options[:tag]
      message[:description] = options[:description] if options[:description]

      if context
        instance_variables = get_instance_variables(context).reject {|k, v| k.to_s.start_with? '@_' }
        class_variables = get_class_variables(context)

        unless instance_variables.empty?
          message[:ext].merge! 'Instance Variables' => stringify_hash(instance_variables)
        end

        unless class_variables.empty?
          message[:ext].merge! 'Class Variables' => stringify_hash(class_variables)
        end
      end

      if request
        message[:ext].merge!({
          'Request' => stringify_hash(simplify_hash(request.env)),
          'Parameters' => request.params
        })
        message[:ext].merge! 'Session' => stringify_hash(request.session) unless request.session.empty?
        message[:ext].merge! 'Cookies' => request.cookies unless request.cookies.empty?

        message[:summaries].merge!({
          'Method' => request.env['REQUEST_METHOD'],
          'URL' => request.env['REQUEST_URI'],
          'Server Port' => request.env['SERVER_PORT']
        })

        append_framwork_info_to message, error, request
      end

      message
    end

    def send_message message, path, key
      uri = URI(get_config['url'])
      uri.path = path
      Net::HTTP.post_form uri, key => MultiJson.dump(message)
    end

    def stringify_hash hash
      hash.inject({}) {|h, (k, v)| h[k] = v.inspect; h }
    end

    InitialzeError = Class.new StandardError

    extend self
    if defined?(::Rails)
      case ::Rails::VERSION::MAJOR
      when 2
        require 'garm_howl/frameworks/rails2'
        extend Rails2
      when 3, 4
        require 'garm_howl/frameworks/rails3'
        extend Rails3
      else
        raise "Doesn't support the current Rails version (#{::Rails::VERSION::STRING})"
      end
    elsif defind?(Sinatra)
      require 'garm_howl/frameworks/sinatra'
      extend Sinatra
    else
      require 'garm_howl/frameworks/no_framework'
      extend NoFramework
    end
end
