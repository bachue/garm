# This module is for something common amoung all Rails version

module Garm
  module Rails
    def possible_version_paths
      [::Rails.root.join('public')]
    end

    def possible_config_paths
      [::Rails.root.join('config')]
    end

    def parse_config content
      content[::Rails.env]
    end

    def append_framwork_info_to message, error, request
      message[:summaries].merge!({
        'Controller' => request.params['controller'],
        'Action' => request.params['action']
      })
      message[:description] ||= "A #{error.class.name} occurred in #{request.params['controller']}##{request.params['action']}"
    end
  end
end