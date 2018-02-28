#!/usr/bin/ruby

desc "Generate index"


task :generate_search => :environment do
  counter = 1
  songs = Song.all
  c = Song.count
  songs.each do |s|
    s.search = s.artist + " " + s.album + " " + s.date + " " + s.title
    s.save
    print "\r%02d%% " % (counter*100.0/c).to_i
    STDOUT.flush
    counter += 1
  end
  puts
end
