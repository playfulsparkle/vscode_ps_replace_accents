import { searchAndReplaceCaseSensitive, diacriticRegex } from "./shared";
import { allLanguageCharacterMappings } from "./characterMappings";

/**
 * A utility class for removing diacritics and accent marks from text while preserving case.
 * Uses Unicode normalization and custom character mappings for comprehensive diacritic removal.
 */
class DiacriticRemover {
    /**
     * Replaces accented characters in a text string with their non-accented equivalents.
     * Uses a two-step process: custom character mappings followed by Unicode normalization.
     * 
     * Processing order:
     * 1. Applies custom character mappings (case-sensitive)
     * 2. Uses Unicode normalization (NFD) to decompose characters
     * 3. Removes diacritical marks using regex
     * 
     * @param {string} text - The input string containing accented characters to be replaced
     * @param {Record<string, string>} [userCharacterMappings={}] - Optional custom character mapping object to override default replacements
     * 
     * @returns {string} The input string with accents removed, or the original text if processing fails
     * 
     * @throws {Error} Logs error to console but returns original text to prevent breaking calling code
     * 
     * @see {@link allLanguageCharacterMappings} for default character replacements
     * @see {@link searchAndReplaceCaseSensitive} for case preservation logic
     * @see {@link diacriticRegex} for Unicode diacritic matching pattern
     */
    removeDiacritics(
        text: string,
        userCharacterMappings: Record<string, string> = {}
    ): string {
        if (!text || typeof text !== "string") {
            return text;
        }

        try {
            // Merge default mappings with custom overrides
            const combinedMappings = { ...allLanguageCharacterMappings, ...userCharacterMappings };

            // Early return if no mappings
            if (Object.keys(combinedMappings).length === 0) {
                return this.normalize(text);
            }

            // Escape special regex characters and build pattern
            const specialChars = Object.keys(combinedMappings).map(letter => letter).join("");
            const customPattern = new RegExp(`[${specialChars}]`, "g");

            // Apply custom mappings FIRST (before normalization)
            const result = text.replace(customPattern, match => {
                const replacement = combinedMappings[match];

                return searchAndReplaceCaseSensitive(match, replacement);
            });

            // Then normalize remaining characters using Unicode decomposition
            return this.normalize(result);
        } catch (error) {
            console.error("Error in removeDiacritics:", error);
            return text;
        }
    }

    private normalize(str: string): string {
        return str.normalize("NFKD").replace(diacriticRegex, "");
    }
}

export default DiacriticRemover;