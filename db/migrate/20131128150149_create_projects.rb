class CreateProjects < ActiveRecord::Migration
  def up
    create_table :projects do |t|
      t.string :name, limit: 20, null: false
      t.timestamps
    end
  end

  def down
    drop_table :projects
  end
end
