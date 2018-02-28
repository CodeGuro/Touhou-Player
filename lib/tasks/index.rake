#!/usr/bin/ruby

desc "Generate index"


task :index => :environment do
  require "mp3info"
  require "yaml"
  counter = 1
  songs = ActiveRecord::Base::connection.select_values("SELECT id FROM songs ORDER BY album_artist, date, album, tracknum, title")
  songs.each do |i|
    song = Song.find(i)
    song.index = counter
    song.save
    print "\r" + counter.to_s
    counter += 1
  end
  puts
end
