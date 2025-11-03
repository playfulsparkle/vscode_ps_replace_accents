
/**
 * Represents an accented letter with its ASCII equivalent
 * @typedef {Object} AccentedLetter
 * @property {string} letter - The accented character (e.g., 'é', 'ñ')
 * @property {string} ascii - The ASCII representation (e.g., 'e', 'n')
 */
interface AccentedLetter {
    letter: string;
    ascii: string;
}

/**
 * Represents a collection of accented letters for a specific language
 * @typedef {Object} LanguageLetters
 * @property {string} language - The name of the language (e.g., 'Spanish', 'French')
 * @property {AccentedLetter[]} letters - Array of accented letters used in the language
 */
interface LanguageLetters {
    language: string;
    letters: AccentedLetter[];
}

/**
 * Language-specific character mappings for diacritic removal
 * 
 * Provides comprehensive mappings for accented characters to their ASCII equivalents
 * across multiple languages. Each language entry contains case-sensitive mappings
 * for both lowercase and uppercase characters organized as an array of AccentedLetter objects.
 * 
 * @constant {LanguageLetters[]}
 * @global
 */
export const languageCharacterMappings: LanguageLetters[] = [
    {
        language: "czech",
        letters: [
            { letter: "á", ascii: "a" }, { letter: "Á", ascii: "A" },
            { letter: "č", ascii: "c" }, { letter: "Č", ascii: "C" },
            { letter: "ď", ascii: "d" }, { letter: "Ď", ascii: "D" },
            { letter: "é", ascii: "e" }, { letter: "É", ascii: "E" },
            { letter: "ě", ascii: "e" }, { letter: "Ě", ascii: "E" },
            { letter: "í", ascii: "i" }, { letter: "Í", ascii: "I" },
            { letter: "ň", ascii: "n" }, { letter: "Ň", ascii: "N" },
            { letter: "ó", ascii: "o" }, { letter: "Ó", ascii: "O" },
            { letter: "ř", ascii: "r" }, { letter: "Ř", ascii: "R" },
            { letter: "š", ascii: "s" }, { letter: "Š", ascii: "S" },
            { letter: "ť", ascii: "t" }, { letter: "Ť", ascii: "T" },
            { letter: "ú", ascii: "u" }, { letter: "Ú", ascii: "U" },
            { letter: "ů", ascii: "u" }, { letter: "Ů", ascii: "U" },
            { letter: "ý", ascii: "y" }, { letter: "Ý", ascii: "Y" },
            { letter: "ž", ascii: "z" }, { letter: "Ž", ascii: "Z" }
        ]
    },
    {
        language: "danish",
        letters: [
            { letter: "æ", ascii: "ae" }, { letter: "Æ", ascii: "Ae" },
            { letter: "ø", ascii: "oe" }, { letter: "Ø", ascii: "Oe" },
            { letter: "å", ascii: "aa" }, { letter: "Å", ascii: "Aa" }
        ]
    },
    {
        language: "french",
        letters: [
            { letter: "à", ascii: "a" }, { letter: "À", ascii: "A" },
            { letter: "â", ascii: "a" }, { letter: "Â", ascii: "A" },
            { letter: "ä", ascii: "a" }, { letter: "Ä", ascii: "A" },
            { letter: "æ", ascii: "ae" }, { letter: "Æ", ascii: "Ae" },
            { letter: "ç", ascii: "c" }, { letter: "Ç", ascii: "C" },
            { letter: "é", ascii: "e" }, { letter: "É", ascii: "E" },
            { letter: "è", ascii: "e" }, { letter: "È", ascii: "E" },
            { letter: "ê", ascii: "e" }, { letter: "Ê", ascii: "E" },
            { letter: "ë", ascii: "e" }, { letter: "Ë", ascii: "E" },
            { letter: "ï", ascii: "i" }, { letter: "Ï", ascii: "I" },
            { letter: "î", ascii: "i" }, { letter: "Î", ascii: "I" },
            { letter: "ô", ascii: "o" }, { letter: "Ô", ascii: "O" },
            { letter: "ö", ascii: "o" }, { letter: "Ö", ascii: "O" },
            { letter: "œ", ascii: "oe" }, { letter: "Œ", ascii: "Oe" },
            { letter: "ù", ascii: "u" }, { letter: "Ù", ascii: "U" },
            { letter: "û", ascii: "u" }, { letter: "Û", ascii: "U" },
            { letter: "ü", ascii: "u" }, { letter: "Ü", ascii: "U" },
            { letter: "ÿ", ascii: "y" }, { letter: "Ÿ", ascii: "Y" }
        ]
    },
    {
        language: "german",
        letters: [
            { letter: "ä", ascii: "ae" }, { letter: "Ä", ascii: "Ae" },
            { letter: "ö", ascii: "oe" }, { letter: "Ö", ascii: "Oe" },
            { letter: "ü", ascii: "ue" }, { letter: "Ü", ascii: "Ue" },
            { letter: "ß", ascii: "ss" }, { letter: "ẞ", ascii: "SS" }
        ]
    },
    {
        language: "hungarian",
        letters: [
            { letter: "á", ascii: "a" }, { letter: "Á", ascii: "A" },
            { letter: "é", ascii: "e" }, { letter: "É", ascii: "E" },
            { letter: "í", ascii: "i" }, { letter: "Í", ascii: "I" },
            { letter: "ó", ascii: "o" }, { letter: "Ó", ascii: "O" },
            { letter: "ö", ascii: "o" }, { letter: "Ö", ascii: "O" },
            { letter: "ő", ascii: "o" }, { letter: "Ő", ascii: "O" },
            { letter: "ú", ascii: "u" }, { letter: "Ú", ascii: "U" },
            { letter: "ü", ascii: "u" }, { letter: "Ü", ascii: "U" },
            { letter: "ű", ascii: "u" }, { letter: "Ű", ascii: "U" }
        ]
    },
    {
        language: "polish",
        letters: [
            { letter: "ą", ascii: "a" }, { letter: "Ą", ascii: "A" },
            { letter: "ć", ascii: "c" }, { letter: "Ć", ascii: "C" },
            { letter: "ę", ascii: "e" }, { letter: "Ę", ascii: "E" },
            { letter: "ł", ascii: "l" }, { letter: "Ł", ascii: "L" },
            { letter: "ń", ascii: "n" }, { letter: "Ń", ascii: "N" },
            { letter: "ó", ascii: "o" }, { letter: "Ó", ascii: "O" },
            { letter: "ś", ascii: "s" }, { letter: "Ś", ascii: "S" },
            { letter: "ź", ascii: "z" }, { letter: "Ź", ascii: "Z" },
            { letter: "ż", ascii: "z" }, { letter: "Ż", ascii: "Z" }
        ]
    },
    {
        language: "slovak",
        letters: [
            { letter: "á", ascii: "a" }, { letter: "Á", ascii: "A" },
            { letter: "ä", ascii: "a" }, { letter: "Ä", ascii: "A" },
            { letter: "č", ascii: "c" }, { letter: "Č", ascii: "C" },
            { letter: "ď", ascii: "d" }, { letter: "Ď", ascii: "D" },
            { letter: "é", ascii: "e" }, { letter: "É", ascii: "E" },
            { letter: "í", ascii: "i" }, { letter: "Í", ascii: "I" },
            { letter: "ľ", ascii: "l" }, { letter: "Ľ", ascii: "L" },
            { letter: "ĺ", ascii: "l" }, { letter: "Ĺ", ascii: "L" },
            { letter: "ň", ascii: "n" }, { letter: "Ň", ascii: "N" },
            { letter: "ó", ascii: "o" }, { letter: "Ó", ascii: "O" },
            { letter: "ô", ascii: "o" }, { letter: "Ô", ascii: "O" },
            { letter: "ŕ", ascii: "r" }, { letter: "Ŕ", ascii: "R" },
            { letter: "š", ascii: "s" }, { letter: "Š", ascii: "S" },
            { letter: "ť", ascii: "t" }, { letter: "Ť", ascii: "T" },
            { letter: "ú", ascii: "u" }, { letter: "Ú", ascii: "U" },
            { letter: "ý", ascii: "y" }, { letter: "Ý", ascii: "Y" },
            { letter: "ž", ascii: "z" }, { letter: "Ž", ascii: "Z" }
        ]
    },
    {
        language: "spanish",
        letters: [
            { letter: "á", ascii: "a" }, { letter: "Á", ascii: "A" },
            { letter: "é", ascii: "e" }, { letter: "É", ascii: "E" },
            { letter: "í", ascii: "i" }, { letter: "Í", ascii: "I" },
            { letter: "ó", ascii: "o" }, { letter: "Ó", ascii: "O" },
            { letter: "ú", ascii: "u" }, { letter: "Ú", ascii: "U" },
            { letter: "ü", ascii: "u" }, { letter: "Ü", ascii: "U" },
            { letter: "ñ", ascii: "n" }, { letter: "Ñ", ascii: "N" }
        ]
    },
    {
        language: "swedish",
        letters: [
            { letter: "å", ascii: "aa" }, { letter: "Å", ascii: "Aa" },
            { letter: "ä", ascii: "ae" }, { letter: "Ä", ascii: "Ae" },
            { letter: "ö", ascii: "oe" }, { letter: "Ö", ascii: "Oe" }
        ]
    }
];

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
export const allLanguageCharacterMappings: Record<string, string> = Object.fromEntries(
    languageCharacterMappings.flatMap(lang => lang.letters.map(o => [o.letter, o.ascii]))
);