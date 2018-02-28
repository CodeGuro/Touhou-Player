class AddOrigImageToSongs < ActiveRecord::Migration
  def self.up
    add_column :songs, :orig_image, :text
  end

  def self.down
    remove_column :songs, :orig_image
  end
end
