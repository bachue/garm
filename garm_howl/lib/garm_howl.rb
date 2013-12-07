require 'garm_howl/version'
require 'socket'
require 'pathname'
require 'yaml'
require 'uri'
require 'net/http'

module Garm
  attr_accessor :project, :hostname, :ip_addr, :timezone, :pid, :version, :config_path

  def howl *args
    message = build_message(*build_params(args))
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
      filenames = ['version', 'version.txt']

      possible_version_paths.each do |dir|
        filenames.each do |filename|
          path = Pathname.new "#{dir}/#{filename}"
          return path.read if path.exist?
        end
      end
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

    def build_message error, context, request, options
      raise ArgumentError.new 'Please give me an exception' unless error.is_a?(Exception)

      project = options[:project] || @project
      raise InitialzeError.new 'Please set current project name which you registered in Garm server' unless project

      init_variables

      message = {
        :project => project,
        :exception_type => error.class.name,
        :message => error.message,
        :backtrace => error.backtrace,
        :time_utc => Time.now.utc.to_i,
        :svr_host => @hostname,
        :svr_zone => @timezone,
        :pid => @pid,
        :version => (@version unless @version == :unknown),
        :important => !!options[:important],
        :tag => options['tag'],
        :position => options[:position] || error.backtrace.first,
        :description => options[:description],
        :summaries => options[:summaries] || {},
        :ext => {'Environment' => ENV}.merge(options[:ext] || {})
      }

      if context
        message[:ext].merge!({
          'Instance Variables' => stringify_hash(get_instance_variables(options[:context])),
          'Class Variables' => stringify_hash(get_class_variables(options[:context]))
        })
      end

      if request
        message[:ext].merge!({
          'Request' => stringify_hash(simplify_hash(request.env)),
          'Parameters' => request.params,
          'Session' => stringify_hash(request.session),
          'Cookies' => request.cookies
        })
        message[:summaries].merge!({
          'Method' => request.env['REQUEST_METHOD'],
          'URL' => request.env['REQUEST_URI'],
          'Server Port' => request.env['SERVER_PORT']
        })

        append_framwork_info_to message, error, request
      end

      message
    end

    def send_message message
      uri = URI(get_config['url'])
      uri.path = '/api/log'
      Net::HTTP.post_form uri, 'log' => MultiJson.dump(message)
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
