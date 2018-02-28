class AddIndexToSongs < ActiveRecord::Migration
  def self.up
    add_column :songs, :index, :integer
    add_index :songs, :index
  end

  def self.down
    remove_column :songs, :index
    remove_index :songs, :index
  end
end
