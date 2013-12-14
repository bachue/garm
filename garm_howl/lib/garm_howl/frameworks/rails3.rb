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

    module Reporter
      class Middleware
        def initialize app
          @app = app
        end

        def call env
          request = Rack::Request.new env
          if request.path_info == '/_error' && request.request_method == 'POST'
            params = request.params
            e = FrontendExceptionGenerator.generate params['name'], params['message'], params['backtrace']
            Garm.howl(e,
              :summaries => {'URL' => params['url'], 'User Agent' => request.user_agent},
              :description => "A #{params['name']} occurred in #{params['url']}",
              :ext => {'Cookies' => request.cookies})
            [200, {}, ['']]
          else
            @app.call env
          end
        end
      end
    end
  end

  class Engine < ::Rails::Engine
    config.app_middleware.use Rails::Reporter::Middleware
    config.app_middleware.use Rails::Exceptions::Middleware
    config.app_middleware.use Rails::Logger::Middleware
  end
end
