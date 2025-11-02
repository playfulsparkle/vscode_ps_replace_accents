
export const diacriticRegex = /[\p{Mn}\u0300-\u036f]/gu;

// Language-specific character mappings
export const languageSpecificMappings: Record<string, Record<string, string>> = {
    "czech": {
        "á": "a", "Á": "A", "č": "c", "Č": "C", "ď": "d", "Ď": "D", "é": "e",
        "É": "E", "ě": "e", "Ě": "E", "í": "i", "Í": "I", "ň": "n", "Ň": "N",
        "ó": "o", "Ó": "O", "ř": "r", "Ř": "R", "š": "s", "Š": "S", "ť": "t",
        "Ť": "T", "ú": "u", "Ú": "U", "ů": "u", "Ů": "U", "ý": "y", "Ý": "Y",
        "ž": "z", "Ž": "Z"
    },
    "danish": {
        "æ": "ae", "Æ": "Ae", "ø": "oe", "Ø": "Oe", "å": "aa", "Å": "Aa"
    },
    "french": {
        "à": "a", "À": "A", "â": "a", "Â": "A", "ä": "a", "Ä": "A", "æ": "ae",
        "Æ": "Ae", "ç": "c", "Ç": "C", "é": "e", "É": "E", "è": "e", "È": "E",
        "ê": "e", "Ê": "E", "ë": "e", "Ë": "E", "ï": "i", "Ï": "I", "î": "i",
        "Î": "I", "ô": "o", "Ô": "O", "ö": "o", "Ö": "O", "œ": "oe", "Œ": "Oe",
        "ù": "u", "Ù": "U", "û": "u", "Û": "U", "ü": "u", "Ü": "U", "ÿ": "y",
        "Ÿ": "Y"
    },
    "german": {
        "ä": "ae", "Ä": "Ae", "ö": "oe", "Ö": "Oe", "ü": "ue", "Ü": "Ue",
        "ß": "ss", "ẞ": "SS"
    },
    "hungarian": {
        "á": "a", "Á": "A", "é": "e", "É": "E", "í": "i", "Í": "I", "ó": "o",
        "Ó": "O", "ö": "o", "Ö": "O", "ő": "o", "Ő": "O", "ú": "u", "Ú": "U",
        "ü": "u", "Ü": "U", "ű": "u", "Ű": "U"
    },
    "polish": {
        "ą": "a", "Ą": "A", "ć": "c", "Ć": "C", "ę": "e", "Ę": "E", "ł": "l",
        "Ł": "L", "ń": "n", "Ń": "N", "ó": "o", "Ó": "O", "ś": "s", "Ś": "S",
        "ź": "z", "Ź": "Z", "ż": "z", "Ż": "Z"
    },
    "slovak": {
        "á": "a", "Á": "A", "ä": "a", "Ä": "A", "č": "c", "Č": "C", "ď": "d",
        "Ď": "D", "é": "e", "É": "E", "í": "i", "Í": "I", "ľ": "l", "Ľ": "L",
        "ĺ": "l", "Ĺ": "L", "ň": "n", "Ň": "N", "ó": "o", "Ó": "O", "ô": "o",
        "Ô": "O", "ŕ": "r", "Ŕ": "R", "š": "s", "Š": "S", "ť": "t", "Ť": "T",
        "ú": "u", "Ú": "U", "ý": "y", "Ý": "Y", "ž": "z", "Ž": "Z"
    },
    "spanish": {
        "á": "a", "Á": "A", "é": "e", "É": "E", "í": "i", "Í": "I", "ó": "o",
        "Ó": "O", "ú": "u", "Ú": "U", "ü": "u", "Ü": "U", "ñ": "n", "Ñ": "N"
    },
    "swedish": {
        "å": "aa", "Å": "Aa", "ä": "ae", "Ä": "Ae", "ö": "oe", "Ö": "Oe"
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