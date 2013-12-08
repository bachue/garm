module Garm
  module Model
    class Project < ActiveRecord::Base
      has_many :subscriptions
      has_many :exception_categories
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
      validates :key, uniqueness: true
      validates :exception_type, :message, :project_id, :key, :first_seen_on, presence: true
    end

    class Exception < ActiveRecord::Base
      belongs_to :exception_category
      validates :time_utc, :svr_host, :svr_ip, :svr_host, :pid, :backtrace, :exception_category_id, presence: true
      serialize :tag
      serialize :summaries
      serialize :ext
    end
  end
end