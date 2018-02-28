class AddTrackArtistToSongs < ActiveRecord::Migration
  def self.up
    add_column :songs, :track_artist, :text
  end

  def self.down
    remove_column :songs, :track_artist
  end
end
