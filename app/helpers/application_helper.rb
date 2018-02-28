module ApplicationHelper
  def title(page_title, show_title = true)
    @content_for_title = page_title.to_s
    @show_title = show_title
  end
  def one_line(&block)
      haml_concat capture_haml(&block).html_safe.gsub("\n", '').gsub('\\n', "\n").html_safe
  end
  def debug(v)
    logger.debug "===DEBUG==="
    logger.debug v.class
    logger.debug YAML::dump(v)
    logger.debug "---DEBUG---"
  end
end
