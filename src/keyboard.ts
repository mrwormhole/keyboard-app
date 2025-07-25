export const SHIFT = "shift";
export const ENTER = "enter";
export const BACKSPACE = "backspace";
export const SPACE = "space";

export const ORIGINAL_LAYOUT: string[][] = [
    // Row 1: numbers (excluding backspace)
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", BACKSPACE], // 13
    // Row 2: QWERTY top row
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"], // 13
    // Row 3: ASDF row  (excluding enter)
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", ENTER], // 12
    // Row 4: ZXCV row (excluding shift and space)
    [SHIFT, "\\", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", SPACE], // 13
];

export type LanguageCode = "TH" | "TR";
export type LayoutKey = "TH" | "TH_" | "TR" | "TR_";

export const KEYBOARD_LAYOUTS: Record<LayoutKey, string[][]> = {
    TH: [
        ["ๅ", "/", "-", "ภ", "ถ", "ุ", "ึ", "ค", "ต", "จ", "ข", "ช", BACKSPACE],
        ["ๆ", "ไ", "ำ", "พ", "ะ", "ั", "ี", "ร", "น", "ย", "บ", "ล", "ฃ"],
        ["ฟ", "ห", "ก", "ด", "เ", "้", "่", "า", "ส", "ว", "ง", ENTER],
        [SHIFT, "ฃ", "ผ", "ป", "แ", "อ", "ิ", "ื", "ท", "ม", "ใ", "ฝ", SPACE],
    ],
    TH_: [
        ["+", "๑", "๒", "๓", "๔", "ู", "฿", "๕", "๖", "๗", "๘", "๙", BACKSPACE],
        ["๐", '"', "ฎ", "ฑ", "ธ", "ํ", "๊", "ณ", "ฯ", "ญ", "ฐ", ",", "ฅ"],
        ["ฤ", "ฆ", "ฏ", "โ", "ฬ", "็", "๋", "ษ", "ศ", "ซ", ".", ENTER],
        [SHIFT, "ฅ", "(", ")", "ฉ", "ฮ", "ฺ", "์", "?", "ฒ", "ฬ", "ฦ", SPACE],
    ],
    TR: [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "*", "-", BACKSPACE],
        ["q", "w", "e", "r", "t", "y", "u", "ı", "o", "p", "ğ", "ü", ","],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ş", "i", ENTER],
        [SHIFT, ",", "z", "x", "c", "v", "b", "n", "m", "ö", "ç", ".", SPACE],
    ],
    TR_: [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "*", "-", BACKSPACE],
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Ğ", "Ü", ";"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ş", "İ", ENTER],
        [SHIFT, ";", "Z", "X", "C", "V", "B", "N", "M", "Ö", "Ç", ":", SPACE],
    ],
};
