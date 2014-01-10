require 'thread'

module Garm
  def logger_uuid
    Thread.current[:_logger_uuid]
  end

  def logger_uuid= uuid
    Thread.current[:_logger_uuid] = uuid
  end
end

class ::Logger
  def add_with_adding_uuid severity, message = nil, progname = nil, &block
    if uuid = Garm.logger_uuid and Garm.project
      message = "[#{Garm.project}] <<#{uuid}>> #{message}" unless message.strip.empty?
    end
    add_without_adding_uuid severity, message, progname, &block
  end

  alias_method :add_without_adding_uuid, :add
  alias_method :add, :add_with_adding_uuid
end
