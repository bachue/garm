require 'date'

module Garm
  module Model
    class Project < ActiveRecord::Base
      has_many :subscriptions, dependent: :destroy
      has_many :exception_categories, dependent: :destroy
      has_many :exceptions, through: :exception_categories
      has_many :logs, dependent: :destroy
      validates :name, presence: true, length: { maximum: 20 }, uniqueness: true
      attr_accessor :percent
    end

    class Subscription < ActiveRecord::Base
      belongs_to :project
      validates :project_id, :interval_days, presence: true
      validates :email, presence: true, length: {maximum: 40}
      validates_uniqueness_of :email, :scope => :project_id
    end

    class ExceptionCategory < ActiveRecord::Base
      belongs_to :project
      has_many :exceptions, dependent: :destroy
      validates :exception_type, :message, :project_id, :key, :first_seen_on, presence: true
      validates_uniqueness_of :key, :scope => :project_id

      scope :with_frequence, ->{ joins(:exceptions).select('exception_categories.id', 'count(*) / ((strftime("%s") - exception_categories.first_seen_on)*1.0 / 86400 ) AS f').group('exception_categories.id') }
      scope :with_occurrence_count_version_distribution, ->{ joins(:exceptions).group('exceptions.version').select('exception_categories.id AS id', 'exceptions.version AS version', 'count(*) AS count') }
      scope :with_occurrence_count_date_distribution, ->{ joins(:exceptions).group('date').select('date(time_utc, "unixepoch") AS date', 'count(*) AS count') }

      def frequence
        self.class.with_frequence.find(id).f
      end

      def occurrence_count_version_distribution
        self.class.with_occurrence_count_version_distribution.where(id: id).map do |pair|
          {version: pair.version, count: pair.count}
        end.sort_by do |hash|
          Gem::Version.new hash[:version]
        end
      end

      def occurrence_count_date_distribution
        result = []
        self.class.with_occurrence_count_date_distribution.where(id: id).order('date').map do |pair|
          {date: pair.date, count: pair.count}
        end.each do |pair|
          if result.last.present?
            result.concat dates_in_range(Date.parse(result.last[:date]), Date.parse(pair[:date]))
          end
          result << pair
        end
        result + dates_in_range(Date.parse(result.last[:date]), Date.today + 1)
      end

      private
        def dates_in_range date1, date2
          ((date1 + 1)...date2).map do |date|
            {date: date.strftime('%F'), count: 0}
          end
        end
    end

    class Exception < ActiveRecord::Base
      belongs_to :exception_category
      validates :time_utc, :svr_host, :svr_ip, :svr_host, :pid, :backtrace, :exception_category_id, presence: true
      serialize :tag
      serialize :summaries
      serialize :ext

      delegate :project, to: :exception_category
    end

    class Log < ActiveRecord::Base
      validates :uuid, presence: true
      belongs_to :project
    end
  end
end