#!/usr/bin/ruby

desc "Generate index"


task :fix_spaces => :environment do
  counter = 1
  songs = Song.all
  songs.each do |s|
    s.filename = s.filename.gsub(/\+/,"%20")
    s.image = s.image.gsub(/\+/,"%20")
    s.thumb = s.thumb.gsub(/\+/,"%20")
    s.orig_image = s.orig_image.gsub(/\+/,"%20")
    s.save
    print "\r" + counter.to_s
    counter += 1
  end
  puts
end
