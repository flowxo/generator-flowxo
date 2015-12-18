# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [3.2.1] - 2015-12-18
### Fixed
- Correct version of SDK for scaffolded service.

## [3.2.0] - 2015-12-18
### Added
- Support for services with no auth.

### Fixed
- A regression where the env vars for OAuth services were not correctly underscored.
- OAuth1 env var is now `SERVICE_ID` instead of `SERVICE_KEY`.

## [3.1.3] - 2015-12-15
### Removed
- Stringent node check has been removed so that future versions of node will work ok with generated services.

## [3.1.2] - 2015-12-15
### Fixed
- Repo URLs now point to bitbucket.

## [3.1.1] - 2015-12-13
### Fixed
- Slug and module name are now equivalent.

## [3.1.0] - 2015-12-09
### Added
- Scaffolding `help` property for service's configuration.

### Removed
- Scaffolded `engines` property for service's `package.json`.

## [3.0.0] - 2015-11-05
- Added code to ensure that the developer is running a specific version of node when scaffolding and developing their service. This is to ensure that the development and deployment to the Flow XO platform is using the same underlying runtime.

## [2.1.7] - 2015-10-29
### Fixed
- `sslOAuthCallback` option to false by default.

## [2.1.6] - 2015-10-29
### Updated
- Scaffolded `package.json` file for latest SDK (3.4.0).
- Added `sslOAuthCallback` option to scaffolded `Gruntfile.js`.

## [2.1.5] - 2015-10-27
### Updated
- Simplified update notification.
- Updated helper text when creating a credentials-based service.
- Bumped SDK version for scaffolded service.
- Changed repo location to bitbucket for scaffolded service.

## [2.1.4] - 2015-10-19
### Fixed
- Update notifier being called on startup when no update is available.
- Dependency not present in `package.json`.

## [2.1.3] - 2015-10-19
### Added
- Notify if an update is available.
- Update SDK dependency.

## [2.1.2] - 2015-10-05
### Added
- Support for node v4.

## [2.1.1] - 2015-10-05
### Updated
- SDK dependency.
- Service Node engine.
- Service version set to 0.0.0 by default.

## [2.1.0] - 2015-09-23
### Fixed
- Service names with capital letters in the middle of the name are now slugified correctly (e.g. `WooCommerce` is now slugified to `woocommerce` instead of `woo_commerce`).

### Updated
- SDK dependency.
- Node/npm engines.

## [2.0.2] - 2015-09-22
### Updated
- SDK dependency.

## [2.0.1] - 2015-09-15
### Added
- `debug` flag for printing out version number.

### Changed
- Updated SDK dependency to v2.0.1.
- Updated other dependencies.

## [2.0.0] - 2015-08-18
### Removed
Flow XO services are no longer unit testable, instead the preferred way of testing is via the `grunt run` command. The generator has been updated so that the unit test files are no longer scaffolded.

This is a breaking change, hence the major version number bump.

## [1.0.5] - 2015-08-07
### Added
- `.editorconfig` to scaffolded service.

## [1.0.4] - 2015-08-07
### Updated
- Scaffolded package.json to update service's dependencies.

## [1.0.3] - 2015-05-20
### Added
- Preflight task to scaffolded Gruntfile.

## [1.0.2] - 2015-05-19
### Added
- Webhook port configuration to scaffolded Gruntfile.

## [1.0.1] - 2015-05-19
### Fixed
- Ensure webhook trigger is scaffolded with run script.
- Fixed deprecation warnings when running generator.
- Updated author/contributors.

## 1.0.0 - 2015-05-06
### Added
- Initial release of the generator.

[3.2.1]: https://github.com/flowxo/generator-flowxo/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/flowxo/generator-flowxo/compare/v3.1.3...v3.2.0
[3.1.3]: https://github.com/flowxo/generator-flowxo/compare/v3.1.2...v3.1.3
[3.1.2]: https://github.com/flowxo/generator-flowxo/compare/v3.1.1...v3.1.2
[3.1.1]: https://github.com/flowxo/generator-flowxo/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/flowxo/generator-flowxo/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/flowxo/generator-flowxo/compare/v2.1.7...v3.0.0
[2.1.7]: https://github.com/flowxo/generator-flowxo/compare/v2.1.6...v2.1.7
[2.1.6]: https://github.com/flowxo/generator-flowxo/compare/v2.1.5...v2.1.6
[2.1.5]: https://github.com/flowxo/generator-flowxo/compare/v2.1.4...v2.1.5
[2.1.4]: https://github.com/flowxo/generator-flowxo/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/flowxo/generator-flowxo/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/flowxo/generator-flowxo/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/flowxo/generator-flowxo/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/flowxo/generator-flowxo/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/flowxo/generator-flowxo/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/flowxo/generator-flowxo/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/flowxo/generator-flowxo/compare/v1.0.5...v2.0.0
[1.0.5]: https://github.com/flowxo/generator-flowxo/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/flowxo/generator-flowxo/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/flowxo/generator-flowxo/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/flowxo/generator-flowxo/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/flowxo/generator-flowxo/compare/v1.0.0...v1.0.1
