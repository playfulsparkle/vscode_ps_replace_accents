![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/playful-sparkle.ps-replace-accents?style=flat-square)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/playful-sparkle.ps-replace-accents?style=flat-square)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/stars/playful-sparkle.ps-replace-accents?style=flat-square)

# Playful Sparkle: Replace Accents

**Replace Accents** is a Visual Studio Code extension that converts accented text to ASCII-compatible text and can also restore diacritics to deaccented text.

It normalizes text with **Unicode NFKD**, removes **combining diacritical marks**, then applies **language-specific orthographic mappings** where needed.  
When restoring, it uses **per-language dictionaries**, optional **suffix matching** for inflected forms, and an **ignore list**.

## Remove Diacritics

![Converting accented characters to base Latin equivalents](img/remove-diacritic.gif "Example: č, š, ž → c, s, z")

## Restore Diacritics

![Restoring proper diacritics to Latin text](img/restore-diacritic.gif "Example: eden yemet → edényemet using stem + suffix")

---

## Features

- **Unicode-based diacritic removal**
  Uses **NFKD** to decompose characters, then strips combining marks. Safe for multibyte text and emoji.

- **Language-specific orthographic mappings**
  After normalization, applies language-aware ASCII foldings for common cases, for example:
  - **German:** `ä` to `ae`, `ö` to `oe`, `ü` to `ue`, `ß` to `ss`
  - **Swedish:** `å` to `aa`, `ä` to `ae`, `ö` to `oe`
  - **Danish:** `æ` to `ae`, `ø` to `oe`, `å` to `aa`
  Central European letters map to their base letters when no digraph convention exists.

- **Diacritic restoration**
  Reconstructs accents from per-language word lists, ordered by frequency. Optional suffix matching can restore stems plus endings. You can choose the language and exclude words.

- **Custom mappings**
  Define character-level overrides that run after normalization and built-in mappings. Useful for brands and project rules, for example `œ` to `oe`, `ł` to `l`.

- **Batch processing**
  Run on the entire document, selections, or multiple selections. You can also rename files and folders in Explorer to ASCII.

- **Keyboard shortcuts**
  - **Windows/Linux:** `Ctrl+Alt+R`
  - **macOS:** `Cmd+Alt+R`

- **Multi-Language Support**: The extension's user interface and informational messages are available in English (en), Magyar (hu), Slovenčina (sk), Čeština (cs), Deutsch (de), Français (fr), Polski (pl), Български (bg), Español (es), Italiano (it), 日本語 (ja), 한국어 (ko), Português do Brasil (pt-br), Русский (ru), Türkçe (tr), 简体中文 (zh-cn), 繁體中文 (zh-tw) languages.

---

## Settings

- **Custom character mappings**
  Extra replacements for removal. Runs after normalization and built-in mappings. Examples: `ß` to `ss`, `æ` to `ae`, `œ` to `oe`.

- **Diacritic dictionary for restoring diacritics**
  Language used for restoration. Values: Magyar, Slovenčina, Čeština, Deutsch, Polski, Dansk, Français, Español, Svenska.

- **Try to restore accents in word endings**
  Boolean. Attempts stem matching with original suffix preserved. Improves coverage, may introduce incorrect matches.

- **List of words to exclude from accent restoration**
  Newline separated. Words in this list remain unchanged.

---

## Commands

- **Remove Diacritics**: Remove accents in the active editor or from file or folder names in Explorer.
- **Restore Diacritics**: Restore accents using the selected language dictionary.

---

## Known Issues

- **Non-Latin scripts**  
  The pipeline targets Latin-based text. Cyrillic, Greek, Arabic, Hebrew, and CJK need custom mappings. NFKD alone will not yield readable ASCII for these scripts.

- **Very large files**  
  Processing happens in memory. Large documents can be slow. Prefer running on selections.

- **Custom mapping conflicts**  
  Custom rules run after normalization and built-in mappings. If several rules affect the same base character, the last one applies.

---

## Release Notes

### 0.0.16

- Optimized dictionary loading and processing, safeguards for word and frequncy.

### 0.0.15

- Added language setting for diacritic removal and restoration; default `off`.
- For diacritic removal:
  - When `off`, uses user mappings and Unicode normalization NFKD (Compatibility Decomposition).
  - When set, uses language-specific, user mappings, and Unicode normalization NFKD (Compatibility Decomposition).
- For diacritic restoration uses language-specific mappings and dictionary.

### 0.0.14

- Fixed restoration of multi-character ASCII sequences (e.g., `oe` to `ø`, `Oe` to `Ø`, `AE` to `Æ`) to single letters with correct case.

### 0.0.13

- Improved UI message about actions.
- Removed unused UI translations.

### 0.0.12

- Fixed translation key spelling and removed unused entries.
- Fixed dictionary loading and processing.

### 0.0.11

- Improved restoration of inflected words.  
- Better suffix matching, e.g., `edenyemet` to `edény` + `emet` to `edényemet`.  
- Extended stem detection window.

### 0.0.10

- Added restoration support for Danish, French, Spanish, Swedish, Italian, Portuguese, Norwegian, Icelandic, Dutch, Croatian, Slovenian, Romanian, Lithuanian, Latvian.
- Optional suffix matching (off by default).
- Ignore list for brands and exceptions.
- Cache for frequently restored words.
- Faster restoration and lower memory usage.

### 0.0.9

- Added restoration for Czech, German, Hungarian, Polish, Slovak.

### 0.0.8

- Translated Command Palette category.

### 0.0.7

- Removal for file and folder names in Explorer.

### 0.0.6

- Issue reporting command.

### 0.0.5

- Updated icon theme and description.

### 0.0.4

- Simplified removal via regex.

### 0.0.3

- Added Čeština (cs), Deutsch (de), Français (fr), Polski (pl), Български (bg), Español (es), Italiano (it), 日本語 (ja), 한국어 (ko), Português do Brasil (pt-br), Русский (ru), Türkçe (tr), 简体中文 (zh-cn), 繁體中文 (zh-tw) UI languages.

### 0.0.2

- Optimized processing and selection handling.
- Confirmation only when text changed.

### 0.0.1

- Initial release with NFD/NFKD-based removal and custom mappings.

---

## Support

For any inquiries, bug reports, or feature requests related to the **Playful Sparkle: Replace Accents** extension, please feel free to utilize the following channels:

* **GitHub Issues**: For bug reports, feature suggestions, or technical discussions, please open a new issue on the [GitHub repository](https://github.com/playfulsparkle/vscode_ps_replace_accents/issues). This allows for community visibility and tracking of reported issues.

* **Email Support**: For general questions or private inquiries, you can contact the developer directly via email at `support@playfulsparkle.com`. Please allow a reasonable timeframe for a response.

We encourage users to use the GitHub Issues page for bug reports and feature requests as it helps in better organization and tracking of the extension's development.

---

## License

This extension is licensed under the [BSD-3-Clause License](https://github.com/playfulsparkle/vscode_ps_replace_accents/blob/main/LICENSE). See the `LICENSE` file for complete details.

---

## Author

Hi! We're the team behind Playful Sparkle, a creative agency from Slovakia. We got started way back in 2004 and have been having fun building digital solutions ever since. Whether it's crafting a brand, designing a website, developing an app, or anything in between, we're all about delivering great results with a smile. We hope you enjoy using our Visual Studio Code extension!
