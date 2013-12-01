class CreateExceptionCategories < ActiveRecord::Migration
  def up
    create_table :exception_categories do |t|
      t.string :exception_type, limit: 40, null: false
      t.text :message, null: false
      t.text :comment
      t.integer :project_id, null: false
      t.boolean :important, default: false, null: false
      t.boolean :wont_fix, default: false, null: false
      t.boolean :resolved, default: false, null: false
      t.string :key, limit: 40, null: false
      t.datetime :first_seen_on, null: false
      t.string :first_seen_in, limits: 11
      t.timestamps
    end

    add_index :exception_categories, :key, name: 'exception_categories_key_uniq_index', unique: true
  end

  def down
    remove_index :exception_categories, name: 'exception_categories_key_uniq_index'
    drop_table :exception_categories
  end
end
