 
#CACHE = MemCache.new memcache_options
#CACHE.servers = '127.0.0.1:11211'
if Rails.env == "production" || Rails.env == "cached"
  begin
     PhusionPassenger.on_event(:starting_worker_process) do |forked|
       if forked
         # We're in smart spawning mode, so...
         # Close duplicated memcached connections - they will open themselves
         #CACHE.reset
         Rails.cache.instance_variable_get("@data").reset
       end
     end
  # In case you're not running under Passenger (i.e. devmode with mongrel)
  rescue NameError => error
  end
end
