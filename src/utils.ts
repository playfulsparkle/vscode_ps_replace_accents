
export function removeAccents(str: string): string {
    return str
        .normalize("NFD") // Decompose characters into base + accents
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .split('')
        .map((char, index) => {
            const originalChar = str[index];
            const isUpperCase = originalChar === originalChar.toUpperCase();
            return isUpperCase ? char.toUpperCase() : char.toLowerCase();
        })
        .join('');
}