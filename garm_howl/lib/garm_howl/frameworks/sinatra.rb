module Garm
  module Sinatra
    def possible_version_paths
      [File.join(Sinatra::Base.settings.root || '.', 'public'),
       File.join(Sinatra::Base.settings.public_folder || '.')]
    end

    def possible_config_paths
      [File.join(Sinatra::Base.settings.root || '.'),
       File.join(Sinatra::Base.settings.root || '.', 'config')]
    end

    def parse_config content
      content[Sinatra::Base.settings.environment.to_s]
    end

    def append_framwork_info_to message, error, request
      message[:summaries].merge!({
        'Route' => request.env['sinatra.route']
      })
      message[:description] ||= "A #{error.class.name} occurred in #{request.env['sinatra.route']}"
    end
  end
end