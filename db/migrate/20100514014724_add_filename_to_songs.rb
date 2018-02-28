class AddFilenameToSongs < ActiveRecord::Migration
  def self.up
    add_column :songs, :filename, :text
  end

  def self.down
    remove_column :songs, :filename
  end
end
