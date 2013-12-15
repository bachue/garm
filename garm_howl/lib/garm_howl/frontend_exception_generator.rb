module Garm
  class FrontendExceptionGenerator
    def self.generate(type, message, backtrace)
      # TODO: Consider about concurrency here
      kls = Object.const_set(type, FrontendException.new(:message, :backtrace))
      kls.new message, backtrace.split(/\s*\n\s*/)[1..-1]
    end
  end

  FrontendException = Class.new(Struct)
end