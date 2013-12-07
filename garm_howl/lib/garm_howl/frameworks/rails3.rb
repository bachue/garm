require 'garm_howl/frameworks/rails'

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
            params = [e]
            params << env['action_controller.instance'].request if env['action_controller.instance']
            params << {:project => ::Rails::Application.subclasses.first.parent.name} unless Garm.project
            Garm.howl(*params)
            raise
          end
        end
      end
    end
  end

  class Railtie < ::Rails::Railtie
    config.app_middleware.use Rails::Exceptions::Middleware
  end
end