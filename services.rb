module Garm
  module Service
    class ProjectQuickLoader
      def self.load category_limit = :all, exception_limit = :all
        # Just limit categories and exceptions, always load all subscriptions and projects for now
        projects = Project.select(:id)
        projects.inject({}) do |h, project|
          h[project.id] = ExceptionCategoryQuickLoader.load project, category_limit, exception_limit
          h
        end
      end

      def self.resolved_percent project
        resolved_count = project.exceptions.where('exception_categories.resolved' => true).count
        count          = project.exceptions.count
        100 * resolved_count / count
      end
    end

    class ExceptionCategoryQuickLoader
      def self.load project, category_limit = :all, exception_limit = :all, *conditions
        categories = project.exception_categories.select([:id, :exception_type, :message, :comment, :important, :wont_fix, :resolved, :first_seen_on, :first_seen_in])
        categories = categories.where conditions if conditions.present?
        categories = categories.limit category_limit if category_limit != :all
        hash = categories.as_json
        categories.each_with_index do |category, idx|
          hash[idx]['exceptions'] = ExceptionQuickLoader.load category, exception_limit
          hash[idx]['exception_size'] = ExceptionQuickLoader.count category
          hash[idx]['frequence'] = category.frequence
        end
        hash
      end
    end

    class ExceptionQuickLoader
      def self.load category, exception_limit = :all, *conditions
        exceptions = category.exceptions.select([:id, :time_utc, :svr_host, :svr_ip, :svr_zone, :pid, :version, :backtrace, :tag, :position, :description, :summaries, :ext])
        exceptions = exceptions.where conditions if conditions.present?
        exceptions = exceptions.limit exception_limit if exception_limit != :all
        exceptions.as_json
      end

      def self.count category
        category.exceptions.count
      end
    end
  end
end