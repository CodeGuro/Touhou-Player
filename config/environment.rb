# Load the rails application
require File.expand_path('../application', __FILE__)

ActionMailer::Base.delivery_method = :smtp
ActionMailer::Base.smtp_settings = {
   :address => "127.0.0.1",
   :port => 25,
   :domain => "kuukunen.net"
   #:authentication => :login,
   #:user_name => "username",
   #:password => "password",
}
ActionMailer::Base.smtp_settings[:enable_starttls_auto] = false


# Initialize the rails application
Touhou::Application.initialize!

