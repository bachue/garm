class Project < ActiveRecord::Base
  has_many :subscriptions
  validates :name, presence: true, length: { maximum: 20 }, uniqueness: true
end

class Subscription < ActiveRecord::Base
  belongs_to :project
  validates :project_id, :interval_days, presence: true
  validates :email, presence: true, length: {maximum: 40}
end