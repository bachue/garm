require 'garm_howl/frameworks/rails'
require 'thread'

module Garm
  module Rails3
    include Rails
  end

  module Rails
    module Exceptions
      class Middleware
        def initialize app
          @app = app
        end

        def call env
          begin
            @app.call env
          rescue => e
            Thread.start do # TODO: Remove Thread call here
              params = [e]
              params << env['action_controller.instance'].request if env['action_controller.instance']
              Garm.howl(*params)
            end
            raise
          end
        end
      end
    end

    module Logger
      class Middleware
        def initialize app
          @app = app
        end

        def call env
          uuid = env['action_dispatch.cookies']['_session_uuid']
          unless uuid
            require_relative '../uuid'
            uuid = Garm.uuid_generator.call
            env['action_dispatch.cookies']['_session_uuid'] = uuid
          end
          Garm.logger_uuid = uuid
          @app.call env
        end
      end
    end
  end

  class Railtie < ::Rails::Railtie
    config.app_middleware.use Rails::Exceptions::Middleware
    config.app_middleware.use Rails::Logger::Middleware
  end
end