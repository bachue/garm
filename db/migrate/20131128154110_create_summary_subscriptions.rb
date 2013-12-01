class CreateSummarySubscriptions < ActiveRecord::Migration
  def up
    create_table :summary_subscriptions do |t|
      t.string :email, limit: 40, null: false
      t.integer :project_id, null: false
      t.integer :interval_days, null: false
      t.date
      t.timestamps
    end

    add_index :summary_subscriptions, [:email, :project_id], unique: true, name: 'summary_subscriptions_email_project_uniq_index'
  end

  def down
    remove_index :summary_subscriptions, name: 'summary_subscriptions_email_project_uniq_index'
    drop_table :summary_subscriptions
  end
end
