# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Changelog Categories

- `BREAKING` for breaking changes.
- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

---
## [2.0.0] - 2026-03-15
### Removed
- Dropped `json5` dependency — uses native `JSON.parse()` everywhere
- Removed firebase authorization logic (handled by `authorized-fetch.js` in UJM)
- Removed `referrer` option (no consumers)
- Removed legacy shorthand options (`options.raw`, `options.json`, `options.text`)

### Added
- ESM source with proper `export default` and named `export { WonderfulFetch }`
- `exports` field in package.json for dual ESM/CJS resolution
- IIFE/CDN build at `dist/wonderful-fetch.min.js`
- Exponential backoff retry logic (3s * attempt, capped at 60s)
- AbortController-based request timeouts
- 28 tests covering all options (up from 8)

### Changed
- Complete rewrite from single 380-line monolith to modular architecture (`src/lib/*.js`)
- Migrated build system to `prepare-package` v2 (bundle mode: ESM, CJS, IIFE)
- Replaced `.npmignore` with `files` field in package.json
- `dist/` is now gitignored (built artifacts not committed)
- Updated README with modern examples and full options table
- Replaced deprecated test endpoints with httpbin.org

### Fixed
- Download streaming now uses `Readable.fromWeb()` for Node 18+ native fetch compatibility

## [1.3.0] - 2024-12-19
### Added
- If `options.referrer` is set to `true` (this is the default), the `x-wonderful-fetch-referrer` header will be added to the request with the value of the current url.

## [1.0.0] - 2024-06-19
### Added
- Initial release of the project 🚀
