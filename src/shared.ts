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
 * Preserves the original text case pattern when replacing characters and
 * attempts to restore accents in inflected words by keeping original suffixes
 * 
 * Applies the case pattern from the original string to the replacement string,
 * handling various case styles including uppercase, lowercase, title case, and mixed case.
 * For inflected words, preserves the suffix from the original when the restored form is shorter.
 * Optimized for performance with fast paths for common cases.
 * 
 * @param {string} original - The original text containing the case pattern to preserve
 * @param {string} restored - The replacement text to apply the case pattern to
 * @returns {string} The restored text with case pattern from the original, potentially with preserved suffixes
 * 
 * @throws {TypeError} If parameters are not strings (handled gracefully)
 */
export function searchAndReplaceCaseSensitive(original: string, restored: string): string {
    if (!original || !restored) {
        return restored;
    }

    const origLen = original.length;
    const restLen = restored.length;
    
    // If restored is longer than original, use the original logic
    if (restLen >= origLen) {
        return applyCasePattern(original, restored);
    }
    
    // Handle inflected words: restored is shorter than original
    // This suggests we have a stem + suffix pattern
    // Try to preserve the suffix from the original
    const restoredWithCase = applyCasePattern(original.substring(0, restLen), restored);
    const suffix = original.substring(restLen);
    
    return restoredWithCase + suffix;
}

/**
 * Applies case pattern from original text to restored text
 * Helper function that contains the original logic
 */
function applyCasePattern(original: string, restored: string): string {
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
            return vscode.l10n.t("Invalid key: '{key}'. Keys must be single characters.", { key });
        }

        if (typeof value !== "string") {
            return vscode.l10n.t("Invalid value for key '{key}': '{value}'. Values must be strings.", { key, value });
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