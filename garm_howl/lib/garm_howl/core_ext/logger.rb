require 'thread'

class ::Logger
  def add_with_adding_uuid severity, message = nil, progname = nil, &block
    if uuid = Thread.current[:_logger_uuid]
      message = "<<#{uuid}>> #{message}"
      Thread.start { Garm.log message } # TODO: Remove this statement
    end
    add_without_adding_uuid severity, message, progname, &block
  end

  alias_method :add_without_adding_uuid, :add
  alias_method :add, :add_with_adding_uuid
end