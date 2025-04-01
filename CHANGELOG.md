# Change Log

All notable changes to the "Playful Sparkle: Replace Accents" extension will be documented in this file.

## [0.0.2] - 2025-04-01

* Internal code refactoring to optimize document processing and selection mechanisms.
* Significant performance improvements in document processing achieved by switching to a line-by-line processing approach, leading to a reduced memory footprint.
* Updated success message behavior: The system now provides confirmation only when modifications have been made to the document.

## [0.0.1] - 2025-03-31

* Initial public release of the **Playful Sparkle: Replace Accents** extension for Visual Studio Code.
* Implemented core text processing functionality leveraging Unicode Normalization Form D (NFD) for the replacement of accented characters with their unaccented counterparts.
* Introduced support for user-defined custom character mappings via the `psReplaceAccents.customMappings` setting.
