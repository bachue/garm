class CreateSubscriptions < ActiveRecord::Migration
  def up
    create_table :subscriptions do |t|
      t.string :email, limit: 40, null: false
      t.references :project, index: true, null: false
      t.integer :interval_days, null: false
      t.date
      t.timestamps
    end

    add_index :subscriptions, [:email, :project_id], unique: true, name: 'subscriptions_email_project_uniq_index'
  end

  def down
    remove_index :subscriptions, name: 'subscriptions_email_project_uniq_index'
    drop_table :subscriptions
  end
end
