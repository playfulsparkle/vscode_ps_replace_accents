"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAccents = replaceAccents;
exports.validateSpecialCharacterMappings = validateSpecialCharacterMappings;
const vscode = __importStar(require("vscode"));
/**
 * Replaces accented characters in a text string with their non-accented equivalents.
 * Uses Unicode normalization (NFD) to decompose characters and removes diacritical marks.
 *
 * @param text - The input string containing accented characters to be replaced
 * @param charMappings - Optional custom character mapping object to override default replacements
 * @returns The input string with accents removed, or the original text if processing fails
 * @defaultValue charMappings = {}
 */
function replaceAccents(text, charMappings = {}) {
    if (!text || typeof text !== "string") {
        return text; // Handle empty or null input
    }
    try {
        // Unicode normalization with decomposition
        const normalized = text.normalize("NFD");
        // Process each character
        return Array.from(normalized)
            .map(char => {
            // Check if character is a combining mark
            if (char.charCodeAt(0) >= 0x0300 && char.charCodeAt(0) <= 0x036F) {
                return "";
            }
            // Handle special cases
            return charMappings[char] || char;
        })
            .join("");
    }
    catch (error) {
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
function validateSpecialCharacterMappings(mappings) {
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
//# sourceMappingURL=utils.js.map