class AddDurationToSong < ActiveRecord::Migration
  def self.up
    add_column :songs, :duration, :string
  end

  def self.down
    remove_column :songs, :duration
  end
end
