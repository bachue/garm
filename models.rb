module Garm
  module Model
    class Project < ActiveRecord::Base
      has_many :subscriptions
      has_many :exception_categories
      has_many :exceptions, through: :exception_categories
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
      has_many :exceptions
      validates :exception_type, :message, :project_id, :key, :first_seen_on, presence: true
      validates_uniqueness_of :key, :scope => :project_id
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
    end
  end
end