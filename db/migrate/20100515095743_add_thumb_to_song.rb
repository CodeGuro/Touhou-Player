class AddThumbToSong < ActiveRecord::Migration
  def self.up
    add_column :songs, :thumb, :text
  end

  def self.down
    remove_column :songs, :thumb
  end
end
