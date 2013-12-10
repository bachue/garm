class CreateLogs < ActiveRecord::Migration
  def up
    create_table :logs do |t|
      t.text :uuid, null: false
      t.text :log, null: false
      t.references :project, index: true, null: false
      t.integer :time_utc, null: false
    end

    add_index :logs, :uuid, name: 'logs_uuid_index'
  end

  def down
    remove_index :logs, name: 'logs_uuid_index'
    drop_table :logs
  end
end
