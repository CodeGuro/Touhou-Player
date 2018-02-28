class ApplicationController < ActionController::Base
  protect_from_forgery
  filter_parameter_logging :password
  layout 'application'

  def debug(v)
    logger.info "===DEBUG==="
    logger.info v.class
    logger.info YAML::dump(v)
    logger.info "---DEBUG---"
  end

  def authorize
    unless admin?
    end
  end

  def admin?
    @admin ||= session[:admin]
  end
end
