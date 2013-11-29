class CreateProjects < ActiveRecord::Migration
  def up
    create_table :projects do |t|
      t.string :name, limit: 20, null: false
      t.timestamps
    end

    add_index :projects, :name, name: 'projects_name_uniq_index', unique: true
  end

  def down
    drop_table :projects
  end
end
