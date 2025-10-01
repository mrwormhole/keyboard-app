const HANGUL_BASE = 0xac00;
const INITIAL_COUNT = 19;
const MEDIAL_COUNT = 21;
const FINAL_COUNT = 28;

const COMPAT_TO_INITIAL: Record<string, number> = {
    ㄱ: 0,
    ㄲ: 1,
    ㄴ: 2,
    ㄷ: 3,
    ㄸ: 4,
    ㄹ: 5,
    ㅁ: 6,
    ㅂ: 7,
    ㅃ: 8,
    ㅅ: 9,
    ㅆ: 10,
    ㅇ: 11,
    ㅈ: 12,
    ㅉ: 13,
    ㅊ: 14,
    ㅋ: 15,
    ㅌ: 16,
    ㅍ: 17,
    ㅎ: 18,
};

const COMPAT_TO_MEDIAL: Record<string, number> = {
    ㅏ: 0,
    ㅐ: 1,
    ㅑ: 2,
    ㅒ: 3,
    ㅓ: 4,
    ㅔ: 5,
    ㅕ: 6,
    ㅖ: 7,
    ㅗ: 8,
    ㅘ: 9,
    ㅙ: 10,
    ㅚ: 11,
    ㅛ: 12,
    ㅜ: 13,
    ㅝ: 14,
    ㅞ: 15,
    ㅟ: 16,
    ㅠ: 17,
    ㅡ: 18,
    ㅢ: 19,
    ㅣ: 20,
};

const COMPAT_TO_FINAL: Record<string, number> = {
    ㄱ: 1,
    ㄲ: 2,
    ㄳ: 3,
    ㄴ: 4,
    ㄵ: 5,
    ㄶ: 6,
    ㄷ: 7,
    ㄹ: 8,
    ㄺ: 9,
    ㄻ: 10,
    ㄼ: 11,
    ㄽ: 12,
    ㄾ: 13,
    ㄿ: 14,
    ㅀ: 15,
    ㅁ: 16,
    ㅂ: 17,
    ㅄ: 18,
    ㅅ: 19,
    ㅆ: 20,
    ㅇ: 21,
    ㅈ: 22,
    ㅊ: 23,
    ㅋ: 24,
    ㅌ: 25,
    ㅍ: 26,
    ㅎ: 27,
};

// Map final consonant index to initial consonant index (for splitting compound finals, use rightmost consonant)
const FINAL_TO_INITIAL: Record<number, number> = {
    1: 0, // ㄱ
    2: 1, // ㄲ
    3: 9, // ㄳ -> ㅅ
    4: 2, // ㄴ
    5: 12, // ㄵ -> ㅈ
    6: 18, // ㄶ -> ㅎ
    7: 3, // ㄷ
    8: 5, // ㄹ
    9: 0, // ㄺ -> ㄱ
    10: 6, // ㄻ -> ㅁ
    11: 7, // ㄼ -> ㅂ
    12: 9, // ㄽ -> ㅅ
    13: 16, // ㄾ -> ㅌ
    14: 17, // ㄿ -> ㅍ
    15: 18, // ㅀ -> ㅎ
    16: 6, // ㅁ
    17: 7, // ㅂ
    18: 9, // ㅄ -> ㅅ
    19: 9, // ㅅ
    20: 10, // ㅆ
    21: 11, // ㅇ
    22: 12, // ㅈ
    23: 14, // ㅊ
    24: 15, // ㅋ
    25: 16, // ㅌ
    26: 17, // ㅍ
    27: 18, // ㅎ
};

// Compound medial vowel combinations: [vowel1, vowel2] -> compound vowel index
const MEDIAL_COMBINATIONS: Record<string, number> = {
    ㅗㅏ: 9, // ㅘ
    ㅗㅐ: 10, // ㅙ
    ㅗㅣ: 11, // ㅚ
    ㅜㅓ: 14, // ㅝ
    ㅜㅔ: 15, // ㅞ
    ㅜㅣ: 16, // ㅟ
    ㅡㅣ: 19, // ㅢ
};

// Compound final consonant combinations: [consonant1, consonant2] -> compound final index
const FINAL_COMBINATIONS: Record<string, number> = {
    ㄱㅅ: 3, // ㄳ
    ㄴㅈ: 5, // ㄵ
    ㄴㅎ: 6, // ㄶ
    ㄹㄱ: 9, // ㄺ
    ㄹㅁ: 10, // ㄻ
    ㄹㅂ: 11, // ㄼ
    ㄹㅅ: 12, // ㄽ
    ㄹㅌ: 13, // ㄾ
    ㄹㅍ: 14, // ㄿ
    ㄹㅎ: 15, // ㅀ
    ㅂㅅ: 18, // ㅄ
};

// When splitting a compound final, what final index should remain
const COMPOUND_FINAL_SPLIT: Record<number, number> = {
    3: 1, // ㄳ -> keep ㄱ
    5: 4, // ㄵ -> keep ㄴ
    6: 4, // ㄶ -> keep ㄴ
    9: 8, // ㄺ -> keep ㄹ
    10: 8, // ㄻ -> keep ㄹ
    11: 8, // ㄼ -> keep ㄹ
    12: 8, // ㄽ -> keep ㄹ
    13: 8, // ㄾ -> keep ㄹ
    14: 8, // ㄿ -> keep ㄹ
    15: 8, // ㅀ -> keep ㄹ
    18: 17, // ㅄ -> keep ㅂ
};

// Reverse lookup: get jamo character from indices
const INITIAL_TO_CHAR: Record<number, string> = Object.fromEntries(
    Object.entries(COMPAT_TO_INITIAL).map(([k, v]) => [v, k]),
);
const MEDIAL_TO_CHAR: Record<number, string> = Object.fromEntries(
    Object.entries(COMPAT_TO_MEDIAL).map(([k, v]) => [v, k]),
);
const FINAL_TO_CHAR: Record<number, string> = Object.fromEntries(
    Object.entries(COMPAT_TO_FINAL).map(([k, v]) => [v, k]),
);

const isInitial = (char: string): boolean => char in COMPAT_TO_INITIAL;
const isMedial = (char: string): boolean => char in COMPAT_TO_MEDIAL;
const isFinal = (char: string): boolean => char in COMPAT_TO_FINAL;

const isSyllable = (char: string): boolean => {
    const code = char.charCodeAt(0);
    return code >= HANGUL_BASE && code <= HANGUL_BASE + INITIAL_COUNT * MEDIAL_COUNT * FINAL_COUNT - 1;
};

export function composeKorean(existingText: string, newChar: string): { text: string; cursorPos: number } {
    const decomposeSyllable = (syllable: string): [number, number, number] => {
        const code = syllable.charCodeAt(0) - HANGUL_BASE;
        const initial = Math.floor(code / (MEDIAL_COUNT * FINAL_COUNT));
        const medial = Math.floor((code % (MEDIAL_COUNT * FINAL_COUNT)) / FINAL_COUNT);
        const final = code % FINAL_COUNT;
        return [initial, medial, final];
    };

    const composeSyllable = (initial: number, medial: number, final: number): string => {
        const code = HANGUL_BASE + initial * MEDIAL_COUNT * FINAL_COUNT + medial * FINAL_COUNT + final;
        return String.fromCharCode(code);
    };

    // If no text or new char is not Korean, just append
    if (existingText.length === 0 || (!isInitial(newChar) && !isMedial(newChar) && !isFinal(newChar))) {
        return { text: existingText + newChar, cursorPos: existingText.length + newChar.length };
    }

    const lastChar = existingText[existingText.length - 1];
    const beforeLast = existingText.substring(0, existingText.length - 1);

    // Case 1: Last char is an initial consonant, new char is a medial vowel
    if (isInitial(lastChar) && isMedial(newChar)) {
        const initial = COMPAT_TO_INITIAL[lastChar];
        const medial = COMPAT_TO_MEDIAL[newChar];
        const syllable = composeSyllable(initial, medial, 0);
        return { text: beforeLast + syllable, cursorPos: beforeLast.length + 1 };
    }

    // Case 2: Last char is a syllable
    if (isSyllable(lastChar)) {
        const [initial, medial, final] = decomposeSyllable(lastChar);

        // Case 2a: Syllable has a final, new char is a medial vowel (split final to new syllable)
        if (final > 0 && isMedial(newChar)) {
            const finalAsInitial = FINAL_TO_INITIAL[final];
            if (finalAsInitial !== undefined) {
                const newMedial = COMPAT_TO_MEDIAL[newChar];
                const newSyllable = composeSyllable(finalAsInitial, newMedial, 0);

                // Check if this is a compound final that needs to be split
                const remainingFinal = COMPOUND_FINAL_SPLIT[final];
                if (remainingFinal !== undefined) {
                    // Keep the first part of the compound final
                    const syllableWithPartialFinal = composeSyllable(initial, medial, remainingFinal);
                    return {
                        text: beforeLast + syllableWithPartialFinal + newSyllable,
                        cursorPos: beforeLast.length + 2,
                    };
                } else {
                    // Remove the entire final
                    const syllableWithoutFinal = composeSyllable(initial, medial, 0);
                    return { text: beforeLast + syllableWithoutFinal + newSyllable, cursorPos: beforeLast.length + 2 };
                }
            }
        }

        // Case 2b: Syllable has a final, new char is a final consonant - try to combine finals
        if (final > 0 && isFinal(newChar)) {
            const currentFinal = FINAL_TO_CHAR[final];
            const combinedKey = currentFinal + newChar;
            const combinedFinal = FINAL_COMBINATIONS[combinedKey];
            if (combinedFinal !== undefined) {
                const syllable = composeSyllable(initial, medial, combinedFinal);
                return { text: beforeLast + syllable, cursorPos: beforeLast.length + 1 };
            }
        }

        // Case 2c: Syllable has no final, new char is a medial vowel - try to combine vowels
        if (final === 0 && isMedial(newChar)) {
            const currentMedial = MEDIAL_TO_CHAR[medial];
            const combinedKey = currentMedial + newChar;
            const combinedMedial = MEDIAL_COMBINATIONS[combinedKey];
            if (combinedMedial !== undefined) {
                const syllable = composeSyllable(initial, combinedMedial, 0);
                return { text: beforeLast + syllable, cursorPos: beforeLast.length + 1 };
            }
        }

        // Case 2d: Syllable has no final, new char can be final - add it as final
        if (final === 0 && isFinal(newChar)) {
            const newFinal = COMPAT_TO_FINAL[newChar];
            const syllable = composeSyllable(initial, medial, newFinal);
            return { text: beforeLast + syllable, cursorPos: beforeLast.length + 1 };
        }

        // Case 2e: Syllable has no final, new char is only initial (not final) - start new syllable
        if (final === 0 && isInitial(newChar) && !isFinal(newChar)) {
            return { text: existingText + newChar, cursorPos: existingText.length + 1 };
        }
    }

    // Default: just append the new character
    return { text: existingText + newChar, cursorPos: existingText.length + newChar.length };
}
