import { searchAndReplaceCaseSensitive, normalizeText } from "./shared";
import { AccentedLetter, LanguageLetters, languageCharacterMappings } from "./characterMappings";

/**
 * A utility class for removing diacritics and accent marks from text while preserving case.
 * Uses Unicode normalization and custom character mappings for comprehensive diacritic removal.
 */
class DiacriticRemover {
    /**
     * Currently active language code (e.g., 'hu', 'fr', 'es')
     * 
     * @type {string | undefined}
     * @private
     */
    private currentLanguage: string | undefined;

    /**
     * Language-specific character mappings for the currently active language
     * 
     * Contains the complete set of special characters and their ASCII equivalents
     * for the current language. This is used to handle language-specific diacritics
     * and special characters that aren't covered by standard Unicode normalization.
     * 
     * @private
     * @type {LanguageLetters | undefined}
     */
    private currentMappings: LanguageLetters | undefined;

    /**
     * Creates a new DiacriticRemover instance
     * 
     * @param {string} language - Language code for dictionary loading (e.g., 'hu', 'fr')
     * 
     * @throws {Error} If language is not provided
     */
    constructor(
        language: string | undefined = undefined,
        userCharacterMappings: Record<string, string> = {}
    ) {
        this.currentLanguage = language;

        // Find language mappings
        const languageMappings = language
            ? languageCharacterMappings.find(lang => lang.language === language)
            : undefined;

        const userLetters: AccentedLetter[] = Object.entries(userCharacterMappings).map(
            ([letter, ascii]) => ({ letter, ascii })
        );

        if (languageMappings) {
            // Merge language mappings with user mappings
            this.currentMappings = {
                language: languageMappings.language,
                letters: [...languageMappings.letters, ...userLetters]
            };
        } else {
             this.currentMappings = {
                language: "",
                letters: userLetters
            };
        }
    }

    /**
     * Generates character mappings for diacritic restoration operations
     * 
     * Provides bidirectional mapping capabilities between diacritic characters and their
     * ASCII equivalents. When `reversed` is false, returns mappings from diacritic characters
     * to ASCII equivalents (used for normalization). When `reversed` is true, returns mappings
     * from ASCII sequences to diacritic characters (used for restoration and case alignment).
     * 
     * @private
     * 
     * @returns {{[key: string]: string}} Object containing character mappings
     */
    private getAllMappings(): { [key: string]: string } {
        if (!this.currentMappings) {
            return {};
        }

        return Object.fromEntries(
            this.currentMappings.letters.map(o => [o.letter, o.ascii])
        );
    }

    /**
     * Gets the special characters pattern computed from currentMappings
     * Computed on demand to save memory
     * 
     * @private
     */
    private getSpecialCharsPattern(): RegExp | undefined {
        if (!this.currentMappings?.letters.length) {
            return undefined;
        }

        const specialChars = this.currentMappings.letters
            .map(o => o.letter)
            .map(char => char)
            .join("");

        return new RegExp(`[${specialChars}]`, "gu");
    }

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
    removeDiacritics(text: string): string {
        if (!text || typeof text !== "string") {
            return text;
        }

        const allMappings = this.getAllMappings();

        if (Object.keys(allMappings).length === 0) {
            return normalizeText(text);
        }

        // Handle remaining special characters if mappings exist
        const specialCharsPattern: RegExp | undefined = this.getSpecialCharsPattern();

        if (!specialCharsPattern) {
            return normalizeText(text);
        }

        let result = text.replace(
            specialCharsPattern,
            match => allMappings[match] ?? match
        );

        return normalizeText(result);
    }
}

export default DiacriticRemover;