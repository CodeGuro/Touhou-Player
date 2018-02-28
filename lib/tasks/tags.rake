#!/usr/bin/ruby

desc "Generate mp3 tags"

task :tags => :environment do
  require "mp3info"
  require "rchardet"

  $icignore = Iconv.new('UTF-8//IGNORE', 'UTF-8')

  def conv(str)
    if str == nil
      return nil
    end
    begin
      cd = CharDet.detect(str)
      puts cd["encoding"]
      if cd["encoding"] == "UTF-16LE" && str.length % 2 == 1
        str += "\x00"
      end
      return Iconv.conv("UTF-8", cd["encoding"], str)
    rescue
      return $icignore.conv(str)
    end
  end

  ActiveRecord::Base.connection.reset_pk_sequence!('songs')
  Rails.cache.clear
  counter = 1

  Song.update_all(:keep => false)

  failcounter = 0
  skipcounter = 0
  convcounter = 0
  
  wd = Dir.getwd
  song_count = Dir.glob("public/songs/**/*/**/*mp3").count
  Dir.glob("public/songs/**/*/**/*mp3").each do |file|
    song = Song.find_by_filename(CGI.escape(file.sub(/^[^\/]*/,"")).gsub(/\+/,"%20").gsub(/%2F/,"/"))
    if song
      fail = false
      title = ""
      track_artist = ""
      album = ""
      Mp3Info.open(file) do |mp3|
        unless mp3
          fail = true
          break
        end
        puts file
        title = conv(mp3.tag.title)
        track_artist = conv(mp3.tag.artist)
        album = conv(mp3.tag.album)
        unless title && track_artist && album && mp3.length
          fail = true
          break
        end
      end
      if fail
        failcounter += 1
        song_count -= 1
        printf "\r%.2f%% conv: %d skip: %d fail: %d ", counter.to_f/song_count*100.0, convcounter, skipcounter, failcounter
        next
      end
      if song.title == title && song.track_artist == track_artist && song.album == album
        song.keep = true
        song.save
        #convert_images(song.tracknum)
        counter += 1
        skipcounter += 1
        printf "\r%.2f%% conv: %d skip: %d fail: %d ", counter.to_f/song_count*100.0, convcounter, skipcounter, failcounter
        next
      end
    end

    song = Song.new()
    track = 1
    track_artist = ""
    album = ""
    fail = false
    Mp3Info.open(file) do |mp3|
      unless mp3
        fail = true
        break
      end
      title = conv(mp3.tag.title)
      track_artist = conv(mp3.tag.artist)
      album = conv(mp3.tag.album)
      unless title && track_artist && album && mp3.length
        fail = true
        break
      end
      sec = (mp3.length+0.5).to_i
      song.title = title
      song.album = album
      song.tracknum = track = mp3.tag.tracknum.to_i
      song.duration = (sec/60).to_i.to_s + ":" + "%02d" % [(sec%60)]
      song.raw = ""
      #song.raw = mp3.to_yaml   ??
    end
    if fail
      failcounter += 1
      song_count -= 1
      printf "\r%.2f%% conv: %d skip: %d fail: %d ", counter.to_f/song_count*100.0, convcounter, skipcounter, failcounter
      next
    end
    date = ""
    #puts file.to_s
    m = file.match(/(\d\d\d\d).\d\d.\d\d/)
    if m
      date = m[1].to_i
      if date < 1970 || date > 2020
        date = ""
      end
    end

    dir = File.dirname(file)
    Dir.chdir(dir)
    dir.sub!(/^[^\/]*/,"")

    images = Dir.glob("*.{JPG,jpg,jpeg,JPEG,gif,GIF,png,PNG,Png,Gif,Jpg,Jpeg}")
    images.delete_if {|a| a =~ /tohoimg/}
    images.delete_if {|a| a =~ /tohobimg/}
    images.sort!
    imageurl = ""
    thumburl = ""
    burl = ""
    if images.any?
      image_id = (track-1) % images.count
      unless File.exists? "tohoimg"+image_id.to_s+".jpg"
        system("convert \"" + images[image_id] + "\" -resize 88x88 -background black -gravity center -extent 88x88 tohoimg"+image_id.to_s+".jpg")
      end
      unless File.exists? "tohobimg"+image_id.to_s+".jpg"
        system("convert \"" + images[image_id] + "\" -resize \"1000x600>\" tohobimg"+image_id.to_s+".jpg")
      end
      thumburl = dir+"/tohoimg"+image_id.to_s+".jpg"
      burl = dir+"/tohobimg"+image_id.to_s+".jpg"
      imageurl = dir+"/"+images[image_id]

      # thumbs 88x88
      # bimg 1000x600
    end

    album_artist = ""
    m = file.match(/\[([^\]]*)\]/)
    if m
      album_artist = m[1]
    end

    album_artist = conv(album_artist)
    song.album_artist = album_artist
    song.track_artist = track_artist
    puts track_artist.class
    puts album_artist.class
    puts track_artist.inspect
    puts album_artist.inspect
    if track_artist[album_artist]
      song.artist = track_artist
    else
      song.artist = album_artist + " / " + track_artist
    end
    song.date = date
    song.search = song.artist + " " + song.album + " " + song.date.to_s + " " + song.title

    song.filename = CGI.escape(file.sub(/^[^\/]*/,"")).gsub(/\+/,"%20").gsub(/%2F/,"/")
    song.image = CGI.escape(burl).gsub(/\+/,"%20").gsub(/%2F/,"/")
    song.thumb = CGI.escape(thumburl).gsub(/\+/,"%20").gsub(/%2F/,"/")
    song.orig_image = CGI.escape(imageurl).gsub(/\+/,"%20").gsub(/%2F/,"/")

    song.keep = true
    song.save

    #puts song.to_yaml
    #puts song.search
    Dir.chdir(wd)
    counter += 1
    convcounter += 1
    printf "\r%.2f%% conv: %d skip: %d fail: %d ", counter.to_f/song_count*100.0, convcounter, skipcounter, failcounter
  end
  Song.delete_all(:keep => false)
  counter = 1
  puts
  puts "Indexing!"
  songs = ActiveRecord::Base::connection.select_values("SELECT id FROM songs ORDER BY album_artist, date, album, tracknum, title")
  songs.each do |i|
    song = Song.find(i)
    song.index = counter
    song.save
    printf "\r%.2f%% ", counter.to_f/song_count*100.0
    counter += 1
  end
  puts
  Rails.cache.clear
end
