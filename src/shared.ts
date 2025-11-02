
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