class AddAlbumArtistToSongs < ActiveRecord::Migration
  def self.up
    add_column :songs, :album_artist, :text
  end

  def self.down
    remove_column :songs, :album_artist
  end
end
