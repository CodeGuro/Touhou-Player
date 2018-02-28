class AddImageToSong < ActiveRecord::Migration
  def self.up
    add_column :songs, :image, :text
  end

  def self.down
    remove_column :songs, :image
  end
end
