class SongsController < ApplicationController
  before_filter :authenticate, :only => [:show, :edit, :create, :new, :destroy, :update]
  if Rails.env == "production" || Rails.env == "cached"
    caches_page :index, :if => Proc.new { |c| c.request.format.html? }
  end

  def index
    respond_to do |format|
      format.html
      format.js do
        search = params[:search]
        @page = params[:page].to_i
        @total_pages = cache("total_pages", search) do
          Song.pages(search)
        end

        if search
          search = CGI::unescape(params[:search])
        end
        key = Digest::MD5.hexdigest([:rsearch, search, @page].inspect)
        r = Rails.cache.read(key)
        if r.nil?
          @songs = Song.search(search, @page)
          r = render_to_string :type => :js, :object => @songs, :layout => false
          Rails.cache.write(key, r)
        end
        render :js => r, :layout => false
      end
      format.json do
        search = params[:search]
        @page = params[:page].to_i
        @total_pages = cache("total_pages", search) do
          Song.pages(search)
        end

        if search
          search = CGI::unescape(params[:search])
        end
        key = Digest::MD5.hexdigest([:rsearch, search, @page].inspect + "json")
        r = Rails.cache.read(key)
        if r.nil?
          @songs = Song.search(search, @page)
          r = render_to_string :layout => false, :text => @songs.to_json(:except => [:raw, :updated_at, :created_at])
          Rails.cache.write(key, r)
        end
        render :json => r, :layout => false
      end
    end
  end
  
  def show
    id = params[:id].to_i
    @song = Song.find(id)
    respond_to do |format|
      format.html
    end
  end

  def find
    id = params[:id].to_i
    @song = Song.find(id)
    respond_to do |format|
      format.json { render :json => @song.to_json(:except => [:raw, :updated_at, :created_at]) }
    end
  end

  def settings
    if params[:after] && %w(stop random next).include?(params[:after])
        session[:after] = params[:after]
    end
    if params[:queue] && %w(default show hide).include?(params[:queue])
        session[:queue] = params[:queue]
    end
    if params[:volume]
        vol = params[:volume].to_i
        if vol >= 0 && vol <= 100
          session[:volume] = vol
        end
    end
    render :nothing => true
  end

  def save_queue
    session[:queue] = params[:queue]
    render :nothing => true
  end

  def load_queue
    list = session[:queue]
    if list.nil? || list.empty?
      render :nothing => true
      return
    end
    ids = []
    list.split(",").each do |i|
      ids << i.to_i if i.to_i > 0
    end
    if ids.empty?
      render :nothing => true
      return
    end
    @songs = Song.find(ids)
  end

  def next
    respond_to do |format|
      format.json do
        search = params[:search]
        #@search_counter = params[:search_counter].to_i
        if search
          search = CGI::unescape(params[:search])
        end
        id = params[:id].to_i
        key = Digest::MD5.hexdigest([:rnext, search, id].inspect)
        r = Rails.cache.read(key)
        if r.nil?
          r = Song.next(search, id).to_json(:except => [:raw, :updated_at, :created_at])
          Rails.cache.write(key, r)
        end
        render :json => r
      end
    end
  end

  def pages
    search = params[:search]
    if search
      search = CGI::unescape(params[:search])
    end
    @pages = cache(:pages, search) do
      Song.pages(search)
    end
    respond_to do |format|
      format.json { render :json => @pages.to_json }
    end
  end

  def get_settings
    respond_to do |format|
      format.json { render :json => [session[:after], session[:click], session[:queue], session[:volume]].to_json }
    end
  end
  
  def new
    @song = Song.new
  end

  def random
    search = params[:search]
    if search
      search = CGI::unescape(params[:search])
    end
    @song = Song.random(search)
    respond_to do |format|
      format.json { render :json => @song.to_json(:except => [:raw, :updated_at, :created_at]) }
    end
  end
  
  def create
    @song = Song.new(params[:song])
    if @song.save
      flash[:notice] = "Successfully created song."
      redirect_to @song
      Rails.cache.clear
    else
      render :action => 'new'
    end
  end
  
  def edit
    @song = Song.find(params[:id])
  end
  
  def update
    @song = Song.find(params[:id])
    if @song.update_attributes(params[:song])
      flash[:notice] = "Successfully updated song."
      redirect_to @song
      Rails.cache.clear
    else
      render :action => 'edit'
    end
  end
  
  def destroy
    @song = Song.find(params[:id])
    @song.destroy
    flash[:notice] = "Successfully destroyed song."
    redirect_to songs_url
    Rails.cache.clear
  end

protected

  def cache(*key)
    k = Digest::MD5.hexdigest(key.inspect)
    r = Rails.cache.read(k)
    if r.nil?
      r = yield
      Rails.cache.write(k, r)
    else
      logger.info "Loaded from cache: " + k.inspect
    end
    r
  end

  def authenticate
    authenticate_or_request_with_http_basic do |name, password|
      name == "aki" && password == "siion"
    end
  end
end
