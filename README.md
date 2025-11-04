![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/playful-sparkle.ps-replace-accents?style=flat-square)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/playful-sparkle.ps-replace-accents?style=flat-square)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/stars/playful-sparkle.ps-replace-accents?style=flat-square)

# Playful Sparkle: Replace Accents

**Playful Sparkle: Replace Accents** is a Visual Studio Code extension that turns accented text into clean, ASCII friendly text, and can also restore accents back.

It uses Unicode normalization (NFKD) to split characters into base letters and marks, removes the marks, then applies language specific rules.

When needed, it can restore diacritics from language dictionaries. You select the language in the settings, you can enable suffix matching for inflected forms, and you can exclude words that must stay unchanged.

## Remove Diacritics

![Demonstration of converting accented characters to their base Latin equivalents](img/remove-diacritic.gif "Shows text transformation from accented characters like 'č, š, ž' to plain 'c, s, z'")

## Restore Diacritics

![Demonstration of restoring proper diacritics to Latin text](img/restore-diacritic.gif "Shows text transformation from plain characters back to properly accented forms")

---

## Features

* **Unicode based accent and diacritic removal**: Uses Unicode normalization (NFD or NFKD) to decompose characters, then strips combining marks. Works with multibyte text and emoji.

* **Language specific orthographic mappings**: After normalization applies language aware mappings for Hrvatski [Croatian, hr], Čeština [Czech, cs], Dansk [Danish, da], Nederlands [Dutch, nl], Français [French, fr], Deutsch [German, de], Magyar [Hungarian, hu], Íslenska [Icelandic, is], Italiano [Italian, it], Latviešu [Latvian, lv], Lietuvių [Lithuanian, lt], Norsk [Norwegian, no], Polski [Polish, pl], Português [Portuguese, pt], Română [Romanian, ro], Slovenčina [Slovak, sk], Slovenščina [Slovenian, sl], Español [Spanish, es], and Svenska [Swedish, sv]. This keeps common ASCII fallbacks for these languages.

* **Accent and diacritic restoration**: Restores accents from language dictionaries. Uses frequency ordered entries and optional suffix matching to restore inflected forms. You can pick the language and you can ignore words.

* **Custom mappings**: Lets you define character level overrides that run after normalization and after the built in tables. Useful for brand names and project specific rules.

* **Batch processing**: Works on the whole document, on one selection or on multiple selections with multi cursor. Can also rename files and folders in Explorer to ASCII.

* **Keyboard shortcuts**:
    - Windows and Linux: `Ctrl+Alt+R`  
    - macOS: `Cmd+Alt+R`

* **Multi-Language Support**: The extension's user interface and informational messages are available in English (en), Magyar (hu), Slovenčina (sk), Čeština (cs), Deutsch (de), Français (fr), Polski (pl), Български (bg), Español (es), Italiano (it), 日本語 (ja), 한국어 (ko), Português do Brasil (pt-br), Русский (ru), Türkçe (tr), 简体中文 (zh-cn), 繁體中文 (zh-tw) languages.

---

## Settings

* **Custom character mappings**: Define extra replacements for accent removal. Runs after normalization and after the built in language mappings. Use for cases like `ß → ss`, `æ → ae`, `œ → oe`, or to keep product and brand names unchanged.
* **Diacritic dictionary for restoring diacritics**: Language used for restoration. Values: Magyar, Slovenčina, Čeština, Deutsch, Polski, Dansk, Français, Español, Svenska.
* **Try to restore accents in word endings**: Boolean option. Tries to rebuild inflected forms by looking at stems and suffixes. Can improve results. Can also create wrong restores. Leave disabled if you need strict output.
* **List of words to exclude from accent restoration**: Newline separated list. Any word here will stay exactly as it is, even if it is present in the dictionary.

---

## Commands

* **Remove Diacritics**: Remove accents in the active editor or from file or folder names in Explorer.
* **Restore Diacritics**: Restore accents using the selected language dictionary.

---

## Known Issues

* **Non-Latin Script Support**: The extension primarily relies on Unicode Normalization Form D (NFD) to decompose accented characters into base characters and combining diacritical marks. While this method effectively handles many accented characters in Latin-based scripts, its effectiveness with other script systems (e.g., Cyrillic, Greek, Arabic, CJK) may be limited. Characters in these scripts might not decompose in the same way, and therefore, the accent removal process might not yield the desired results. Users working with non-Latin scripts may need to rely more heavily on custom mappings, and even then, comprehensive support is not guaranteed.

* **Performance with Large Documents**: The extension processes the entire document content in memory after applying Unicode normalization. For very large documents, this in-memory processing, along with the subsequent iteration through each character, could lead to increased memory consumption and processing time. Users might experience a temporary slowdown or unresponsiveness in the Visual Studio Code editor, especially with files containing a very high character count.

* **Custom Mapping Considerations**: Custom mappings defined in the `psReplaceAccents.customMappings` setting are applied *after* the Unicode normalization and diacritic removal steps. This implies that custom mappings should generally target the base characters (those remaining after the diacritics are removed). Conflicts in custom mappings could arise if multiple mappings target the same base character, leading to the last defined mapping taking precedence. Additionally, if a custom mapping is intended to handle a character that the normalization process already modifies or removes, the custom mapping might not behave as expected. Users should carefully consider the interaction between Unicode normalization and their custom mappings.

If you encounter any of these or other issues, please report them on the [GitHub Issues page](https://github.com/playfulsparkle/vscode_ps_replace_accents/issues) with detailed steps to reproduce the problem.

---

## Release Notes

### 0.0.12

* Fixed translate key name spelling and removed unused translation.
* Fixed reading and processing dictionaries

### 0.0.11

**Fixed:**
    - **Accent Restoration for Inflected Words:** Resolved issue where words without diacritics weren't properly restored to their correct diacritic forms, especially in inflected words with suffixes.
    - **Enhanced Suffix Matching:** Improved handling of cases like "edenyemet" → "edényemet" by preserving original suffixes while restoring diacritic stems.
    - **Extended Stem Detection:** Expanded dictionary lookup to consider shorter stems (down to 2 characters) for better coverage of inflected forms.

### 0.0.10

* Added diacritic restoration for Danish, French, Spanish, Swedish, Italian, Portuguese, Italian, Norwegian, Icelandic, Dutch, Croatian, Slovenian, Romanian, Lithuanian, and Latvian.
* Added suffix matching for inflected forms (off by default), 
* Added ignored words list for brands/exceptions 
* Added caching most userd words.
* Improved accent restoration ~40–60% faster via cached regex, binary search, streaming reads, fewer allocations; dictionary load ~30% less memory; clearer setting descriptions.

### 0.0.9

* Added diacritic restoration for Czech, German, Hungarian, Polish, and Slovak.

### 0.0.8

* Translated Command Palette category

### 0.0.7

* Add support for removing diacritics from file and folder names.

### 0.0.6

* Introduced a streamlined issue reporting mechanism in alignment with **Microsoft Visual Studio Code** extension development best practices. This enhancement allows users to report bugs, suggest features, and provide feedback more efficiently, improving overall user experience and support responsiveness.

### 0.0.5

* **Enhanced Visuals:** The extension's icon color theme has been updated, providing a more polished and consistent look.
* **Improved User Understanding:** The extension description has been refined to be more clear, concise, and easier for new users to understand its features and benefits.

## 0.0.4

* Reverted to a more efficient method for diacritic removal using regular expressions. This simplifies the implementation compared to the previous character-by-character processing.

## 0.0.3

* Added additional languages: Čeština (cs), Deutsch (de), Français (fr), Polski (pl), Български (bg), Español (es), Italiano (it), 日本語 (ja), 한국어 (ko), Português do Brasil (pt-br), Русский (ru), Türkçe (tr), 简体中文 (zh-cn), 繁體中文 (zh-tw).

### 0.0.2

* Internal code refactoring to optimize document processing and selection mechanisms.
* Significant performance improvements in document processing achieved by switching to a line-by-line processing approach, leading to a reduced memory footprint.
* Updated success message behavior: The system now provides confirmation only when modifications have been made to the document.

### 0.0.1

* Initial public release of the **Playful Sparkle: Replace Accents** extension for Visual Studio Code.
* Implemented core text processing functionality leveraging Unicode Normalization Form D (NFD) for the replacement of accented characters with their unaccented counterparts. This includes handling a wide range of diacritical marks present in Latin-based scripts.
* Introduced support for user-defined custom character mappings via the `psReplaceAccents.customMappings` setting. This feature allows users to specify additional or override default replacement rules for specific characters, providing enhanced flexibility in text normalization.

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

---
