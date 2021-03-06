class CreateExceptions < ActiveRecord::Migration
  def up
    create_table :exceptions do |t|
      t.references :exception_category, index: true, null: false
      t.integer :time_utc, null: false
      t.string :svr_host, limit: 40, null: false
      t.string :svr_ip, limit: 15, null: false
      t.string :svr_zone, limit: 6, null: false
      t.integer :pid, null: false
      t.string :version, limit: 11
      t.text :backtrace, null: false
      t.text :uuid
      t.text :tag
      t.text :position 
      t.text :description
      t.text :summaries
      t.text :ext
    end
  end

  def down
    drop_table :exceptions
  end
end
