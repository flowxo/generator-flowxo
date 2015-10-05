# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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

[2.1.0]: https://github.com/flowxo/generator-flowxo/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/flowxo/generator-flowxo/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/flowxo/generator-flowxo/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/flowxo/generator-flowxo/compare/v1.0.5...v2.0.0
[1.0.5]: https://github.com/flowxo/generator-flowxo/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/flowxo/generator-flowxo/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/flowxo/generator-flowxo/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/flowxo/generator-flowxo/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/flowxo/generator-flowxo/compare/v1.0.0...v1.0.1
