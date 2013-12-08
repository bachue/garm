helpers do
  def rollback(code, message = nil)
    status code
    if message.present?
      logger.error message
      STDERR.puts message
    end
    raise ActiveRecord::Rollback
  end
end