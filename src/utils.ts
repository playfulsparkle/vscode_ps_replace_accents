import * as vscode from "vscode";

/**
 * Replaces accented characters in a text string with their non-accented equivalents.
 * Uses Unicode normalization (NFD) to decompose characters and removes diacritical marks.
 * 
 * @param text - The input string containing accented characters to be replaced
 * @param charMappings - Optional custom character mapping object to override default replacements
 * @returns The input string with accents removed, or the original text if processing fails
 * @defaultValue charMappings = {}
 */
export function replaceAccents(text: string, charMappings: Record<string, string> = {}): string {
    if (!text || typeof text !== "string") {
        return text; // Handle empty or null input
    }

    try {
        // Remove diacritics (accent marks) and convert to lowercase in one step
        let normalized = text.normalize("NFD");

        // Remove combining marks and special characters in one regex operation
        normalized = normalized.replace(/[\u0300-\u036f]/g, "");

        // Process each character
        return Array.from(normalized)
            .map(char => charMappings[char] || char)
            .join("");
    } catch (error) {
        return text;
    }
}

/**
 * Validates a mapping object containing special character replacements.
 * Each key in the mapping must be a single character, and each value must be a string.
 * 
 * @param mappings - An object containing key-value pairs where keys are single characters
 * and values are their corresponding replacement strings
 * 
 * @returns An empty string if validation passes, or a localized error message string if validation fails
 */
export function validateSpecialCharacterMappings(mappings: { [key: string]: string }): string {
    if (!mappings || typeof mappings !== "object") {
        return vscode.l10n.t("Invalid mappings: Not an object.");
    }

    for (const [key, value] of Object.entries(mappings)) {
        if (typeof key !== "string" || key.length !== 1) {
            return vscode.l10n.t('Invalid key: "{key}". Keys must be single characters.', { key });
        }

        if (typeof value !== "string") {
            return vscode.l10n.t('Invalid value for key "${key}": "${value}". Values must be strings.', { key, value });
        }
    }

    return "";
}