# Change Log

All notable changes to the "Playful Sparkle: Replace Accents" extension will be documented in this file.

## [0.0.18] - 2025-11-12

- Fix bug file existence check now verifies exact case on case-insensitive file systems (Windows, macOS)

## [0.0.17] - 2025-11-11

- Added auto language detection for all supported dictionary languages.
- Fixed bug checking file exists for renaming file/folder.

## [0.0.16] - 2025-11-09

- Optimized dictionary loading and processing, safeguards for word and frequncy.

## [0.0.15] - 2025-11-06

- Added language setting for diacritic removal and restoration; default `off`.
- For diacritic removal:
  - When `off`, uses user mappings and Unicode normalization NFKD (Compatibility Decomposition).
  - When set, uses language-specific, user mappings, and Unicode normalization NFKD (Compatibility Decomposition).
- For diacritic restoration uses language-specific mappings and dictionary.

## [0.0.14] - 2025-11-05

- Fixed restoration of multi-character ASCII sequences (e.g., `oe` to `ø`, `Oe` to `Ø`, `AE` to `Æ`) to single letters with correct case.

## [0.0.13] - 2025-11-04

- Improved UI message about actions.
- Removed unused UI translations.

## [0.0.12] - 2025-11-04

- Fixed translation key spelling and removed unused entries.
- Fixed dictionary loading and processing.

## [0.0.11] - 2025-11-03

- Improved restoration of inflected words.  
- Better suffix matching, e.g., `edenyemet` to `edény` + `emet` to `edényemet`.  
- Extended stem detection window.

## [0.0.10] - 2025-11-01

- Added restoration support for Danish, French, Spanish, Swedish, Italian, Portuguese, Norwegian, Icelandic, Dutch, Croatian, Slovenian, Romanian, Lithuanian, Latvian.
- Optional suffix matching (off by default).
- Ignore list for brands and exceptions.
- Cache for frequently restored words.
- Faster restoration and lower memory usage.

## [0.0.9] - 2025-10-31

- Added restoration for Czech, German, Hungarian, Polish, Slovak.

## [0.0.8] - 2025-10-29

- Translated Command Palette category.

## [0.0.7] - 2025-10-28

- Removal for file and folder names in Explorer.

## [0.0.6] - 2025-05-02

- Issue reporting command.

## [0.0.5] - 2025-04-03

- Updated icon theme and description.

## [0.0.4] - 2025-04-02

- Simplified removal via regex.

## [0.0.3] - 2025-04-01

- Added Čeština (cs), Deutsch (de), Français (fr), Polski (pl), Български (bg), Español (es), Italiano (it), 日本語 (ja), 한국어 (ko), Português do Brasil (pt-br), Русский (ru), Türkçe (tr), 简体中文 (zh-cn), 繁體中文 (zh-tw) UI languages.

## [0.0.2] - 2025-04-01

- Optimized processing and selection handling.
- Confirmation only when text changed.

## [0.0.1] - 2025-03-31

- Initial release with NFD/NFKD-based removal and custom mappings.
