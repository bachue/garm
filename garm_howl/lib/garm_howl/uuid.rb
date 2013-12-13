require 'securerandom'

Garm.uuid_generator ||= lambda do
  if SecureRandom.respond_to?(:uuid)
    SecureRandom.uuid
  else
    SecureRandom.hex 64
  end
end