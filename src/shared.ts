
export const diacriticRegex = /[\p{Mn}\u0300-\u036f]/gu;

// Language-specific character mappings
export const languageSpecificMappings: Record<string, Record<string, string>> = {
    // Czech specific: Complete mapping for Czech diacritics
    czech: {
        "á": "a", "č": "c", "ď": "d", "é": "e", "ě": "e",
        "í": "i", "ň": "n", "ó": "o", "ř": "r", "š": "s",
        "ť": "t", "ú": "u", "ů": "u", "ý": "y", "ž": "z"
    },

    // Danish specific: Complete mapping for Danish/Norwegian
    danish: {
        "å": "a", "æ": "ae", "ø": "o", "é": "e", "ü": "u",
        "á": "a", "è": "e", "ê": "e", "ó": "o", "ô": "o"
    },

    // French specific: Comprehensive French accent mapping
    french: {
        "à": "a", "â": "a", "æ": "ae", "ç": "c", "é": "e",
        "è": "e", "ê": "e", "ë": "e", "î": "i", "ï": "i",
        "ô": "o", "œ": "oe", "ù": "u", "û": "u", "ü": "u",
        "ÿ": "y"
    },

    // German specific: Complete German umlaut and eszett mapping
    german: {
        "ä": "a", "ö": "o", "ü": "u", "ß": "s", "é": "e",
        "à": "a", "è": "e", "ù": "u"
    },

    // Hungarian specific: Comprehensive Hungarian accent mapping
    hungarian: {
        "á": "a", "é": "e", "í": "i", "ó": "o", "ö": "o",
        "ő": "o", "ú": "u", "ü": "u", "ű": "u"
    },

    // Polish specific: Complete Polish diacritic mapping
    polish: {
        "ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n",
        "ó": "o", "ś": "s", "ź": "z"
    },

    // Slovak specific: Comprehensive Slovak diacritic mapping
    slovak: {
        "á": "a", "ä": "a", "č": "c", "ď": "d", "é": "e",
        "í": "i", "ľ": "l", "ĺ": "l", "ň": "n", "ó": "o",
        "ô": "o", "ŕ": "r", "š": "s", "ť": "t", "ú": "u",
        "ý": "y", "ž": "z"
    },

    // Spanish specific: Complete Spanish accent mapping
    spanish: {
        "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
        "ü": "u", "ñ": "n"
    },

    // Swedish specific: Complete Swedish character mapping
    swedish: {
        "å": "a", "ä": "a", "ö": "o", "é": "e", "ü": "u",
        "à": "a", "è": "e", "ô": "o"
    }
};

// Pre-computed merged mappings from all languages (for performance)
export const mergedLanguageMappings: Record<string, string> = Object.assign(
    {},
    ...Object.values(languageSpecificMappings)
);

export function preserveOriginalCase(original: string, restored: string): string {
    if (!original || !restored) {
        return restored;
    }

    const origLen = original.length;
    const restLen = restored.length;

    // Fast path: all uppercase
    if (original === original.toUpperCase()) {
        return restored.toUpperCase();
    }

    // Fast path: title case (first letter uppercase, rest lowercase)
    if (origLen > 0 &&
        original[0] === original[0].toUpperCase() &&
        (origLen === 1 || original.slice(1) === original.slice(1).toLowerCase())) {
        return restored[0].toUpperCase() + restored.slice(1).toLowerCase();
    }

    // Fast path: all lowercase
    if (original === original.toLowerCase()) {
        return restored.toLowerCase();
    }

    // Character-by-character case preservation for mixed case
    let result = "";
    const minLength = Math.min(origLen, restLen);

    for (let i = 0; i < minLength; i++) {
        const origChar = original[i];
        result += origChar === origChar.toUpperCase()
            ? restored[i].toUpperCase()
            : restored[i].toLowerCase();
    }

    // Handle remaining characters if restored is longer
    if (restLen > minLength) {
        const lastCharIsUpper = origLen > 0 &&
            original[origLen - 1] === original[origLen - 1].toUpperCase();

        for (let i = minLength; i < restLen; i++) {
            result += lastCharIsUpper
                ? restored[i].toUpperCase()
                : restored[i].toLowerCase();
        }
    }

    return result;
}