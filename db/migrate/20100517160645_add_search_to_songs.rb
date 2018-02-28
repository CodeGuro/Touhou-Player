class AddSearchToSongs < ActiveRecord::Migration
  def self.up
    add_column :songs, :search, :text
  end

  def self.down
    remove_column :songs, :search
  end
end
