# This module is for something common amoung all Rails version

require 'digest'

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

    def simplify_hash hash
      hash.inject({}) do |h, (k, v)|
        classes = [v.class] + v.class.parents
        classes = classes[0...classes.index(Object)]
        h[k] =  if classes.include?(ActionDispatch::Routing) ||
                   classes.include?(ActionDispatch::RemoteIp) ||
                   v.class.name.end_with?('Controller')
                  "#<#{v.class} object>"
                else 
                  v
                end
        h
      end
    end

    def sha1 type, message, backtrace
      backtrace = backtrace.select {|trace| trace.start_with? ::Rails.root.to_s }
                    .map {|trace| trace.match(/^(.+?):(\d+)(|:in `(.+)')$/); [$1,$4].join(':') }
      Digest::SHA1.hexdigest "#{type}-#{message}-#{backtrace.join("\n")}"
    end
  end
end
