# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20131128160601) do

  create_table "exception_categories", force: true do |t|
    t.string   "type",          limit: 40,                 null: false
    t.text     "message",                                  null: false
    t.text     "comment"
    t.integer  "project_id",                               null: false
    t.boolean  "important",                default: false, null: false
    t.boolean  "wont_fix",                 default: false, null: false
    t.boolean  "resolved",                 default: false, null: false
    t.string   "hash",          limit: 40,                 null: false
    t.datetime "first_seen_on",                            null: false
    t.string   "first_seen_in"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "exception_categories", ["hash"], name: "exception_categories_hash_uniq_index", unique: true

  create_table "exceptions", force: true do |t|
    t.datetime "time",                   null: false
    t.string   "svr_host",    limit: 40, null: false
    t.string   "svr_ip",      limit: 15, null: false
    t.string   "svr_zone",    limit: 6,  null: false
    t.integer  "pid",                    null: false
    t.string   "version",     limit: 11
    t.text     "backtrace",              null: false
    t.text     "tag"
    t.text     "position"
    t.text     "description"
    t.text     "summaries"
    t.text     "ext"
  end

  create_table "projects", force: true do |t|
    t.string   "name",       limit: 20, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "projects", ["name"], name: "projects_name_uniq_index", unique: true

  create_table "subscriptions", force: true do |t|
    t.string   "email",         limit: 40, null: false
    t.integer  "project_id",               null: false
    t.integer  "interval_days",            null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "subscriptions", ["email", "project_id"], name: "subscriptions_email_project_uniq_index", unique: true

end
