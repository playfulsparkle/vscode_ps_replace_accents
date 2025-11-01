import * as vscode from "vscode";
import { mergedLanguageMappings, diacriticRegex, preserveOriginalCase } from "./shared";


/**
 * Replaces accented characters in a text string with their non-accented equivalents.
 * Uses Unicode normalization (NFD) to decompose characters and removes diacritical marks.
 * 
 * @param text - The input string containing accented characters to be replaced
 * @param charMappings - Optional custom character mapping object to override default replacements
 * @returns The input string with accents removed, or the original text if processing fails
 * @defaultValue charMappings = {}
 */
export function replaceAccents(
    text: string,
    charMappings: Record<string, string> = {}
): string {
    if (!text || typeof text !== "string") {
        return text;
    }

    try {
        const combinedMappings = { ...mergedLanguageMappings, ...charMappings };
        const specialChars = Object.keys(combinedMappings).join("");
        const customPattern = new RegExp(`[${specialChars}]`, "g");

        // Apply custom mappings FIRST (before normalization)
        let result = text.replace(customPattern, match => {
            const replacement = combinedMappings[match];

            return preserveOriginalCase(match, replacement);
        });

        // Then normalize remaining characters
        return result.normalize("NFKD").replace(diacriticRegex, "");
    } catch (error) {
        console.error("Error in replaceAccents:", error);

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
export function validateAccentRemoveMapping(mappings: { [key: string]: string }): string {
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