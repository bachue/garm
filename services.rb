module Garm
  module Service
    class ProjectQuickLoader
      def self.load(category_limit, exception_limit)
        # Just limit categories and exceptions, always load all subscriptions and projects for now
        projects = Project.select(:id)
        projects.inject({}) do |h, project|
          h[project.id] = ExceptionCategoryQuickLoader.load project, category_limit, exception_limit
          h
        end
      end
    end

    class ExceptionCategoryQuickLoader
      def self.load(project, category_limit, exception_limit)
        categories = project.exception_categories.select([:id, :exception_type, :message, :comment, :important, :wont_fix, :resolved, :first_seen_on, :first_seen_in]).limit category_limit
        hash = categories.as_json
        categories.each_with_index do |category, idx|
          hash[idx]['exceptions'] = ExceptionQuickLoader.load category, exception_limit
        end
        hash
      end
    end

    class ExceptionQuickLoader
      def self.load(category, exception_limit)
        exceptions = category.exceptions.select([:id, :time, :svr_host, :svr_ip, :svr_zone, :pid, :version, :backtrace, :tag, :position, :description, :summaries, :ext]).limit exception_limit
        exceptions.as_json
      end
    end
  end
end