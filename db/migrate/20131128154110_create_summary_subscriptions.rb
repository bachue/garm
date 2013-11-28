class CreateSummarySubscriptions < ActiveRecord::Migration
  def up
    create_table :summary_subscriptions do |t|
      t.string :email, limit: 40, null: false
      t.integer :project_id, null: false
      t.integer :interval_days, null: false
      t.date
      t.timestamps
    end
  end

  def down
    drop_table :summary_subscriptions
  end
end
