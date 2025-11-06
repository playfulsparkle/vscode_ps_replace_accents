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
 * handles diacritic expansions by using character mappings to determine
 * the correct character alignment between original and restored forms.
 * 
 * For diacritic restoration scenarios where character counts differ due to
 * expansions (e.g., "oe" → "ø", "ae" → "æ"), this function uses character
 * mappings to align the strings properly before applying case patterns.
 * 
 * @param {string} original - The original normalized text (without diacritics)
 * @param {string} restored - The restored text with diacritics
 * @param {Object} [characterMappings] - Optional character mappings for alignmen
 * @returns {string} The restored text with proper case pattern applied
 */
export function searchAndReplaceCaseSensitive(
    original: string, 
    restored: string, 
    characterMappings?: { [key: string]: string }
): string {
    if (!original || !restored) {
        return restored;
    }

    // If character mappings are provided, use advanced processing
    if (characterMappings && Object.keys(characterMappings).length > 0) {
        return applyCasePatternWithMappings(original, restored, characterMappings);
    }
    
    // Fallback to standard case pattern application
    return applyCasePattern(original, restored);
}

/**
 * Applies case pattern using character mappings to handle multi-character expansions
 * 
 * @private
 * @param {string} original - Original normalized text
 * @param {string} restored - Restored text with diacritics  
 * @param {Object} characterMappings - Character mappings for expansions
 * @returns {string} Properly transformed result
 */
function applyCasePatternWithMappings(
    original: string, 
    restored: string, 
    characterMappings: { [key: string]: string }
): string {
    let result = "";
    let i = 0;
    let j = 0;

    // Process both strings character by character, handling multi-character expansions
    while (i < original.length && j < restored.length) {
        // Check for multi-character sequences in original that map to single diacritic
        let matched = false;
        
        // Try 2-character sequences first (like "oe", "ae", "Oe", "AE", etc.)
        if (i + 1 < original.length) {
            const twoChar = original.substring(i, i + 2);
            const diacritic = characterMappings[twoChar];
            
            if (diacritic && diacritic === restored[j]) {
                // Found a multi-character sequence that matches the restored diacritic
                // Apply case logic based on the multi-character sequence
                result += applyCaseToCharacter(twoChar, restored[j]);
                i += 2;
                j += 1;
                matched = true;
            }
        }

        if (!matched) {
            // Standard single character replacement
            result += applyCaseToCharacter(original[i], restored[j]);
            i += 1;
            j += 1;
        }
    }

    // Handle any remaining characters in restored string
    if (j < restored.length) {
        // Use the case pattern from the last character of original
        const lastOrigChar = original[original.length - 1] || "";
        const lastIsUpper = lastOrigChar === lastOrigChar.toUpperCase() && lastOrigChar !== lastOrigChar.toLowerCase();
        const transform = lastIsUpper ? 
            (c: string) => c.toUpperCase() : 
            (c: string) => c.toLowerCase();
            
        for (let k = j; k < restored.length; k++) {
            result += transform(restored[k]);
        }
    }

    return result;
}

/**
 * Applies case pattern from source character to target character
 * 
 * @private
 * @param {string} sourceChar - Character providing the case pattern
 * @param {string} targetChar - Character to apply case to
 * 
 * @returns {string} Target character with appropriate case
 */
function applyCaseToCharacter(sourceChar: string, targetChar: string): string {
    if (sourceChar === sourceChar.toUpperCase()) {
        return targetChar.toUpperCase();
    } else if (sourceChar === sourceChar.toLowerCase()) {
        return targetChar.toLowerCase();
    } else {
        // Mixed case or special handling for multi-character sequences
        // For multi-character sequences, use the case of the first character
        if (sourceChar.length > 1) {
            return sourceChar[0] === sourceChar[0].toUpperCase() 
                ? targetChar.toUpperCase() 
                : targetChar.toLowerCase();
        }
        return targetChar;
    }
}

/**
 * Applies case pattern from original text to restored text
 * Helper function that contains the original logic for same-length strings
 * 
 * @private
 * @param {string} original - The original text containing the case pattern
 * @param {string} restored - The replacement text to apply the case pattern to  
 * @returns {string} The restored text with case pattern from the original
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