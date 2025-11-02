import * as vscode from "vscode";

/**
 * Regular expression for matching diacritical marks and combining characters
 * 
 * This regex uses Unicode property escapes to match:
 * - `\p{Mn}`: Non-spacing marks (diacritics that don't take up space)
 * - `\u0300-\u036f`: Combining diacritical marks Unicode block
 * 
 * @constant {RegExp}
 * @global
 * 
 * @see {@link https://unicode.org/reports/tr44/#GC_Values_Table | Unicode General Category Values}
 * @see {@link https://en.wikipedia.org/wiki/Combining_Diacritical_Marks | Combining Diacritical Marks}
 */
export const diacriticRegex = /[\p{Mn}\u0300-\u036f]/gu;

/**
 * Language-specific character mappings for diacritic removal
 * 
 * Provides comprehensive mappings for accented characters to their ASCII equivalents
 * across multiple languages. Each language object contains case-sensitive mappings
 * for both lowercase and uppercase characters.
 * 
 * @constant {Record<string, Record<string, string>>}
 * @global
 * 
 * @property {Object} czech - Czech language character mappings
 * @property {Object} danish - Danish language character mappings  
 * @property {Object} french - French language character mappings
 * @property {Object} german - German language character mappings
 * @property {Object} hungarian - Hungarian language character mappings
 * @property {Object} polish - Polish language character mappings
 * @property {Object} slovak - Slovak language character mappings
 * @property {Object} spanish - Spanish language character mappings
 * @property {Object} swedish - Swedish language character mappings
 */
export const languageCharacterMappings: Record<string, Record<string, string>> = {
    /** Czech language character mappings */
    "czech": {
        "á": "a", "Á": "A", "č": "c", "Č": "C", "ď": "d", "Ď": "D", "é": "e",
        "É": "E", "ě": "e", "Ě": "E", "í": "i", "Í": "I", "ň": "n", "Ň": "N",
        "ó": "o", "Ó": "O", "ř": "r", "Ř": "R", "š": "s", "Š": "S", "ť": "t",
        "Ť": "T", "ú": "u", "Ú": "U", "ů": "u", "Ů": "U", "ý": "y", "Ý": "Y",
        "ž": "z", "Ž": "Z"
    },
    /** Danish language character mappings */
    "danish": {
        "æ": "ae", "Æ": "Ae", "ø": "oe", "Ø": "Oe", "å": "aa", "Å": "Aa"
    },
    /** French language character mappings */
    "french": {
        "à": "a", "À": "A", "â": "a", "Â": "A", "ä": "a", "Ä": "A", "æ": "ae",
        "Æ": "Ae", "ç": "c", "Ç": "C", "é": "e", "É": "E", "è": "e", "È": "E",
        "ê": "e", "Ê": "E", "ë": "e", "Ë": "E", "ï": "i", "Ï": "I", "î": "i",
        "Î": "I", "ô": "o", "Ô": "O", "ö": "o", "Ö": "O", "œ": "oe", "Œ": "Oe",
        "ù": "u", "Ù": "U", "û": "u", "Û": "U", "ü": "u", "Ü": "U", "ÿ": "y",
        "Ÿ": "Y"
    },
    /** German language character mappings */
    "german": {
        "ä": "ae", "Ä": "Ae", "ö": "oe", "Ö": "Oe", "ü": "ue", "Ü": "Ue",
        "ß": "ss", "ẞ": "SS"
    },
    /** Hungarian language character mappings */
    "hungarian": {
        "á": "a", "Á": "A", "é": "e", "É": "E", "í": "i", "Í": "I", "ó": "o",
        "Ó": "O", "ö": "o", "Ö": "O", "ő": "o", "Ő": "O", "ú": "u", "Ú": "U",
        "ü": "u", "Ü": "U", "ű": "u", "Ű": "U"
    },
    /** Polish language character mappings */
    "polish": {
        "ą": "a", "Ą": "A", "ć": "c", "Ć": "C", "ę": "e", "Ę": "E", "ł": "l",
        "Ł": "L", "ń": "n", "Ń": "N", "ó": "o", "Ó": "O", "ś": "s", "Ś": "S",
        "ź": "z", "Ź": "Z", "ż": "z", "Ż": "Z"
    },
    /** Slovak language character mappings */
    "slovak": {
        "á": "a", "Á": "A", "ä": "a", "Ä": "A", "č": "c", "Č": "C", "ď": "d",
        "Ď": "D", "é": "e", "É": "E", "í": "i", "Í": "I", "ľ": "l", "Ľ": "L",
        "ĺ": "l", "Ĺ": "L", "ň": "n", "Ň": "N", "ó": "o", "Ó": "O", "ô": "o",
        "Ô": "O", "ŕ": "r", "Ŕ": "R", "š": "s", "Š": "S", "ť": "t", "Ť": "T",
        "ú": "u", "Ú": "U", "ý": "y", "Ý": "Y", "ž": "z", "Ž": "Z"
    },
    /** Spanish language character mappings */
    "spanish": {
        "á": "a", "Á": "A", "é": "e", "É": "E", "í": "i", "Í": "I", "ó": "o",
        "Ó": "O", "ú": "u", "Ú": "U", "ü": "u", "Ü": "U", "ñ": "n", "Ñ": "N"
    },
    /** Swedish language character mappings */
    "swedish": {
        "å": "aa", "Å": "Aa", "ä": "ae", "Ä": "Ae", "ö": "oe", "Ö": "Oe"
    }
};

/**
 * Pre-computed merged mappings from all languages for optimal performance
 * 
 * This object combines all language-specific mappings into a single lookup table.
 * Used when language-specific processing isn't required or for fallback handling.
 * 
 * @constant {Record<string, string>}
 * @global
 * 
 * @see {@link languageCharacterMappings} for language-specific versions
 */
export const allLanguageCharacterMappings: Record<string, string> = Object.assign(
    {},
    ...Object.values(languageCharacterMappings)
);

/**
 * Preserves the original text case pattern when replacing characters
 * 
 * Applies the case pattern from the original string to the replacement string,
 * handling various case styles including uppercase, lowercase, title case, and mixed case.
 * Optimized for performance with fast paths for common cases.
 * 
 * @param {string} original - The original text containing the case pattern to preserve
 * @param {string} restored - The replacement text to apply the case pattern to
 * @returns {string} The restored text with case pattern from the original
 * 
 * @throws {TypeError} If parameters are not strings (handled gracefully)
 */
export function searchAndReplaceCaseSensitive(original: string, restored: string): string {
    if (!original || !restored) {
        return restored;
    }

    const origLen = original.length;
    const restLen = restored.length;

    // Check case pattern once
    const upperOrig = original.toUpperCase();
    const lowerOrig = original.toLowerCase();

    // Fast path: all uppercase
    if (original === upperOrig) {
        return restored.toUpperCase();
    }

    // Fast path: all lowercase
    if (original === lowerOrig) {
        return restored.toLowerCase();
    }

    // Fast path: title case
    if (origLen > 0 &&
        original[0] === upperOrig[0] &&
        original.slice(1) === lowerOrig.slice(1)) {
        return restored[0].toUpperCase() + restored.slice(1).toLowerCase();
    }

    // Mixed case: use array for efficient string building
    const result: string[] = new Array(restLen);
    const minLength = Math.min(origLen, restLen);

    for (let i = 0; i < minLength; i++) {
        const origChar = original[i];
        const origLower = lowerOrig[i];
        // Only apply casing to alphabetic characters
        result[i] = origChar === origLower
            ? restored[i].toLowerCase()
            : restored[i].toUpperCase();
    }

    // Handle remaining characters if restored is longer
    if (restLen > minLength) {
        const lastOrigChar = original[origLen - 1];
        const lastIsUpper = lastOrigChar !== lowerOrig[origLen - 1];
        const transform = lastIsUpper ?
            (c: string) => c.toUpperCase() :
            (c: string) => c.toLowerCase();

        for (let i = minLength; i < restLen; i++) {
            result[i] = transform(restored[i]);
        }
    }

    return result.join("");
}

/**
 * Validates user-provided character mappings for diacritic replacement
 * 
 * Ensures that custom character mappings follow the required format:
 * - Each key must be a single character string
 * - Each value must be a string (can be multiple characters)
 * - The mappings object must be a valid object
 * 
 * @param {Object} mappings - User-provided character mappings object to validate
 * @param {string} mappings.key - Single character keys with string values
 * @returns {string} Empty string if validation passes, localized error message if validation fails
 * 
 * @throws {Error} Does not throw errors, returns localized error messages instead
 */
export function validateUserCharacterMappings(mappings: { [key: string]: string }): string {
    if (!mappings || typeof mappings !== "object") {
        return vscode.l10n.t("Invalid mappings: Not an object.");
    }

    for (const [key, value] of Object.entries(mappings)) {
        if (typeof key !== "string" || key.length !== 1) {
            return vscode.l10n.t('Invalid key: "{key}". Keys must be single characters.', { key });
        }

        if (typeof value !== "string") {
            return vscode.l10n.t('Invalid value for key "{key}": "{value}". Values must be strings.', { key, value });
        }
    }

    return "";
}

/**
 * Normalizes and deduplicates a string of ignored words into a clean array
 * 
 * Processes a newline-separated string of words into a normalized array:
 * - Splits by newlines
 * - Trims whitespace from each word
 * - Removes empty lines
 * - Deduplicates using a Set
 * 
 * @param {string} str - Input string containing newline-separated words
 * @returns {string[]} Array of unique, trimmed words
 */
export function normalizeIgnoreWords(str: string): string[] {
    return Array.from(
        new Set(
            str
                .split("\n")
                .map(word => word.trim())
                .filter(word => word.length > 0)
        )
    );
}