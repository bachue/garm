require "garm_howl/version"
require 'socket'

module Garm
  extend self

  attr_accessor :project, :hostname, :ip_addr, :timezone, :pid, :version

  def howl(error = $!, opts = {})
    error, opts = $!, error if error.is_a?(Hash)

    raise ArgumentError.new 'Please give me an exception' unless error.is_a?(Exception)
    raise InitialzeError.new 'Please set current project name which you registered in Garm server' unless @project

    init

    message = {
      :project => @project,
      :exception_type => error.class.name,
      :message => error.message,
      :backtrace => error.backtrace,
      :time_utc => Time.now.utc.to_i,
      :svr_host => @hostname,
      :svr_zone => @timezone,
      :pid => @pid,
      :important => !!opts[:important],
      :tag => opts['tag'],
      :position => opts[:position] || error.backtrace.first,
      :description => opts[:description],
      :summaries => opts[:summaries] || {},
      :ext => {'Environment' => ENV}.merge(opts[:ext] || {})
    }

    if opts[:context]
      message[:ext].merge({
        'Instance Variables' => get_instance_variables(opts[:context]),
        'Class Variables' => get_class_variables(opts[:context])
      })
    end

    if defined?(Rails)
      # TODO: Add Rails specfic parameter here
    end
  end

  private
    def init
      @hostname ||= Socket.gethostname
      @ip_addr  ||= IPSocket.getaddress(@hostname)
      @timezone ||= Time.now.strftime('%:z')
      @pid      ||= Process.pid
      @version  ||= get_version
    end

    def get_version
      if defined?(Rails)
        choices = [Rails.root.join('public', 'version'), Rails.root.join('public', 'version.txt')]
        choices.each do |choice|
          return choice.read if choice.exist?
        end
      end
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

    InitialzeError = Class.new StandardError
end
