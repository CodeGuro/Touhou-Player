class Song < ActiveRecord::Base
  #attr_accessible :title, :artist, :album, :tracknum, :date
  attr_accessible :title, :artist, :album, :tracknum, :date

  def self.random(search)
    if search.nil? || search.empty?
      if (c = count()) != 0
        find(:first, :offset =>rand(c))
      end
    else
      if (c = count(:conditions => search_conds(search))) != 0
        find(:first, :offset =>rand(c), :conditions => search_conds(search))
      end
    end
  end
  
  def self.next(search, id)
    t = find(id)
    #a = where("index = ?", t.index+1).first
    #a = find(:first, :conditions => ['NOT(album_artist < ? OR ( artist = ? AND (date < ? OR (date = ? AND (album < ?  OR (album = ? AND (tracknum < ?  OR (tracknum = ? AND title >= ?))))))))',
             #t.artist, t.artist, t.date,t.date, t.album, t.album,t.tracknum, t.tracknum,t.title],
             #:order => "index")
      #a = where("index = 1").first
    if search.nil? ||search.empty?
      a = where("index = ?", t.index+1).first
      if a.nil?
        a = where("index = 1").first
      end
    else
      a = where(search_conds(search)).where("index > ?", t.index).order("index").first
      if a.nil?
        a = where(search_conds(search)).order("index").first
      end
    end
    a
  end
  
  def self.pages(search)
    if search.nil? or search.empty? 
      (count/40.0).ceil
    else
      (count(:conditions => search_conds(search))/40.0).ceil
    end
  end
    

  def self.search(search, page)
    per_page = 40
    if search.nil? or search.empty? 
      #paginate :per_page => per_page, :page => page, :order => "index"
      order("index").limit(per_page).offset(per_page*(page-1))
    else
      where(search_conds(search)).order("index").limit(per_page).offset(per_page*(page-1))
      #paginate :per_page => per_page, :page => page, :order => "index",
               #:conditions => search_conds(search)
    end
  end 
protected
  def self.search_conds(str)
    arguments = []
    [str.split(" OR ").map do |strand|
      strand.gsub!(/%|\(|\)|_|\|/, '|\0')
      ar = strand.split(" ")
      arguments += ar.map{|i| "%"+i+"%"}
      (["search ILIKE ? ESCAPE '|'"]*ar.size).join(" AND ")
    end.map {|s| "(" + s + ")"}.join(" OR ")] + arguments
  end
end
