# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 1.0.7 2016-11-18
### Added
- bot.botService.verifyRequest(appSecret, headers, body) method a helper method to verify the request signature

## 1.0.6 2016-11-18
### Fixed
- 'TypeError: Cannot read property 'url' of null' at FacebookBot.js:151:22

## 1.0.5 2016-11-17
### Added
- bot.on('error', cb) Callback will receive an object { error, sender, message }

## 1.0.4 2016-11-07
### Added
- message.quick_reply.payload is used now instead of message.text for message routing

## [1.0.3] - 2016-06-17
### Added
- Added code samples to README
### Fixed
- Send "raw" message using "channelData" property

## [1.0.2] - 2016-06-16
### Added
- Added README

## [1.0.1] - 2016-06-16
### Added
- Fixed package.json dependencies

## [1.0.0] - 2016-06-16
### Initial release
