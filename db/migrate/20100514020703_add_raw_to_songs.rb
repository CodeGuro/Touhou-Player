class AddRawToSongs < ActiveRecord::Migration
  def self.up
    add_column :songs, :raw, :text
  end

  def self.down
    remove_column :songs, :raw
  end
end
