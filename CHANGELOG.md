# Change Log

All notable changes to the "Playful Sparkle: Replace Accents" extension will be documented in this file.

## [0.0.8] - 2025-10-29

Translated Command Palette category

## [0.0.7] - 2025-10-28

Add support for removing diacritics from file and folder names.

## [0.0.6] - 2025-05-02

* **Issue Reporting Support:** Introduced a streamlined issue reporting mechanism in alignment with **Microsoft Visual Studio Code** extension development best practices. This enhancement allows users to report bugs, suggest features, and provide feedback more efficiently, improving overall user experience and support responsiveness.

## [0.0.5] - 2025-04-03

* **Enhanced Visuals:** The extension's icon color theme has been updated, providing a more polished and consistent look.
* **Improved User Understanding:** The extension description has been refined to be more clear, concise, and easier for new users to understand its features and benefits.

## [0.0.4] - 2025-04-02

* Reverted to a more efficient method for diacritic removal using regular expressions. This simplifies the implementation compared to the previous character-by-character processing.

## [0.0.3] - 2025-04-01

* Added additional languages: Čeština (cs), Deutsch (de), Français (fr), Polski (pl), Български (bg), Español (es), Italiano (it), 日本語 (ja), 한국어 (ko), Português do Brasil (pt-br), Русский (ru), Türkçe (tr), 简体中文 (zh-cn), 繁體中文 (zh-tw).

## [0.0.2] - 2025-04-01

* Internal code refactoring to optimize document processing and selection mechanisms.
* Significant performance improvements in document processing achieved by switching to a line-by-line processing approach, leading to a reduced memory footprint.
* Updated success message behavior: The system now provides confirmation only when modifications have been made to the document.

## [0.0.1] - 2025-03-31

* Initial public release of the **Playful Sparkle: Replace Accents** extension for Visual Studio Code.
* Implemented core text processing functionality leveraging Unicode Normalization Form D (NFD) for the replacement of accented characters with their unaccented counterparts.
* Introduced support for user-defined custom character mappings via the `psReplaceAccents.customMappings` setting.
