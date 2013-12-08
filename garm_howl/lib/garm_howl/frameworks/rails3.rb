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
              params << {:project => ::Rails::Application.subclasses.first.parent.name} unless Garm.project
              Garm.howl(*params)
            end
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