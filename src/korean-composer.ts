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

        // Case 2a: Syllable has no final, new char is a final consonant
        if (final === 0 && isFinal(newChar)) {
            const newFinal = COMPAT_TO_FINAL[newChar];
            const syllable = composeSyllable(initial, medial, newFinal);
            return { text: beforeLast + syllable, cursorPos: beforeLast.length + 1 };
        }

        // Case 2b: Syllable has no final, new char is an initial consonant (start new syllable)
        if (final === 0 && isInitial(newChar)) {
            return { text: existingText + newChar, cursorPos: existingText.length + 1 };
        }

        // Case 2c: Syllable has a final, new char is a medial vowel (split final to new syllable)
        if (final > 0 && isMedial(newChar)) {
            const syllableWithoutFinal = composeSyllable(initial, medial, 0);
            const finalAsInitial = final - 1; // Convert final index to initial index (they overlap)
            const newMedial = COMPAT_TO_MEDIAL[newChar];
            const newSyllable = composeSyllable(finalAsInitial, newMedial, 0);
            return { text: beforeLast + syllableWithoutFinal + newSyllable, cursorPos: beforeLast.length + 2 };
        }
    }

    // Default: just append the new character
    return { text: existingText + newChar, cursorPos: existingText.length + newChar.length };
}
