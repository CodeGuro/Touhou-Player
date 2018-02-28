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
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120425072837) do

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "songs", :force => true do |t|
    t.text     "title"
    t.text     "artist"
    t.text     "album"
    t.integer  "tracknum"
    t.string   "date"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "filename"
    t.text     "raw"
    t.text     "image"
    t.text     "thumb"
    t.string   "duration"
    t.text     "orig_image"
    t.text     "album_artist"
    t.text     "track_artist"
    t.integer  "index"
    t.text     "search"
    t.boolean  "keep",         :default => false
  end

  add_index "songs", ["index"], :name => "index_songs_on_index"

  create_table "users", :force => true do |t|
    t.string   "username"
    t.string   "email"
    t.string   "persistence_token"
    t.string   "crypted_password"
    t.string   "password_salt"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
