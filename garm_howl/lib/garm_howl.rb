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

    InitialzeError = Class.new StandardError
end
