class CreateSongs < ActiveRecord::Migration
  def self.up
    create_table :songs do |t|
      t.text :title
      t.text :artist
      t.text :album
      t.integer :tracknum
      t.string :date
      t.timestamps
    end
  end
  
  def self.down
    drop_table :songs
  end
end
