helpers do
  def rollback(code, message = nil)
    status code
    logger.error message if message.present?
    raise ActiveRecord::Rollback
  end
end