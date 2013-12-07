module Garm
  module NoFramework
    def possible_version_paths
      ['public', '.']
    end

    def possible_config_paths
      ['config', '.']
    end

    def parse_config content
      content
    end

    def append_framwork_info_to message, error, request
    end

    def simplify_hash hash
      hash
    end
  end
end