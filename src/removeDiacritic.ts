
import {
    allLanguageCharacterMappings,
    diacriticRegex,
    searchAndReplaceCaseSensitive
} from "./shared";

class DiacriticRemover {
    /**
 * Replaces accented characters in a text string with their non-accented equivalents.
 * Uses Unicode normalization (NFD) to decompose characters and removes diacritical marks.
 * 
 * @param text - The input string containing accented characters to be replaced
 * @param charMappings - Optional custom character mapping object to override default replacements
 * @returns The input string with accents removed, or the original text if processing fails
 * @defaultValue charMappings = {}
 */
    removeDiacritics(
        text: string,
        charMappings: Record<string, string> = {}
    ): string {
        if (!text || typeof text !== "string") {
            return text;
        }

        try {
            const combinedMappings = { ...allLanguageCharacterMappings, ...charMappings };
            const specialChars = Object.keys(combinedMappings).join("");
            const customPattern = new RegExp(`[${specialChars}]`, "g");

            // Apply custom mappings FIRST (before normalization)
            let result = text.replace(customPattern, match => {
                const replacement = combinedMappings[match];

                return searchAndReplaceCaseSensitive(match, replacement);
            });

            // Then normalize remaining characters
            return result.normalize("NFKD").replace(diacriticRegex, "");
        } catch (error) {
            console.error("Error in removeDiacritics:", error);

            return text;
        }
    }
}

export default DiacriticRemover;