class AddKeepToSong < ActiveRecord::Migration
  def self.up
    add_column :songs, :keep, :boolean, :default => false
  end

  def self.down
    remove_column :songs, :keep
  end
end
