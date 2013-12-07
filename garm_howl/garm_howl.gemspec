# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'garm_howl/version'

Gem::Specification.new do |spec|
  spec.name          = "garm_howl"
  spec.version       = Garm::VERSION
  spec.authors       = ["Bachue Zhou"]
  spec.email         = ["bachue.shu@gmail.com"]
  spec.description   = 'Hawl from Garm, it sends all your exceptions and logs to Garm server.'
  spec.summary       = spec.description + "\nSpecific optimization for Rails, but can also apply to any Ruby app."
  spec.homepage      = ""
  spec.license       = "GPLv2"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency 'bundler', '~> 1.3'
  spec.add_development_dependency 'rake'

  spec.add_dependency 'multi_json'
end