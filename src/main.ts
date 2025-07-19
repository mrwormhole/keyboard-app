import { Menu, MenuItem, Submenu } from "@tauri-apps/api/menu";

type KeyData = {
    key: string;
    element: HTMLButtonElement;
    originalText: string; // Store original button text
};

const SHIFT = "shift";
const ENTER = "enter";
const BACKSPACE = "backspace";
const SPACE = " ";

const KEYBOARD_LAYOUTS = {
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

type LanguageCode = "TH" | "TR";
type LayoutKey = "TH" | "TH_" | "TR" | "TR_";

class KeyboardApp {
    private textInput: HTMLTextAreaElement;
    private keyButtons: KeyData[];
    private currentLanguage: LanguageCode;
    private isShifted: boolean;

    constructor() {
        this.textInput = document.getElementById("textInput") as HTMLTextAreaElement;
        this.currentLanguage = "TH";
        this.isShifted = false;

        // Initialize key buttons and store their original text
        this.keyButtons = Array.from(document.querySelectorAll(".key-button[data-key]")).map((button) => {
            const element = button as HTMLButtonElement;
            const key = element.dataset.key;
            if (!key) throw new Error("data-key attribute missing despite selector");

            return {
                key,
                element,
                originalText: element.textContent || key,
            };
        });

        this.initializeKeyButtonStructure();
        this.initializeEventListeners();
        this.updateKeyboardDisplay();
    }

    private initializeKeyButtonStructure(): void {
        // Restructure each button to show both original and mapped characters
        this.keyButtons.forEach(({ element, originalText, key }) => {
            // Skip special keys that shouldn't show dual characters
            if ([SHIFT, ENTER, BACKSPACE].includes(key) || key === " ") {
                return;
            }

            // Create container structure for dual display
            element.innerHTML = `
				<span class="key-original">${originalText}</span>
				<span class="key-mapped"></span>
			`;
            element.style.position = "relative";
            element.style.display = "flex";
            element.style.justifyContent = "space-between";
            element.style.alignItems = "center";
        });
    }

    private initializeEventListeners(): void {
        // Keypress listener
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            console.log(event.key);
            this.handleKeyPress(event.key);
        });

        // Click listeners
        this.keyButtons.forEach(({ key, element }) => {
            element.addEventListener("click", (e: MouseEvent) => {
                e.preventDefault();

                if (key === BACKSPACE) {
                    this.handleBackspace();
                } else if (key === SHIFT) {
                    this.handleShift();
                } else if (key === ENTER) {
                    this.handleEnter();
                } else {
                    // Get the actual character from current layout
                    const character = this.getCharacterForPosition(key);
                    if (character && character !== SPACE) {
                        this.appendToInput(character);
                    } else if (character === SPACE) {
                        this.appendToInput(" ");
                    }
                }

                this.animateButton(element);
                element.blur();
            });
        });
    }

    private handleKeyPress(key: string): void {
        // Only handle if input is not focused
        if (document.activeElement === this.textInput) {
            return;
        }

        key = key.toLowerCase();

        // Handle special keys
        if (key === "shift") {
            this.handleShift();
            const btn = this.keyButtons.find((btn) => btn.key === SHIFT);
            if (btn) this.animateButton(btn.element);
            return;
        }

        if (key === "backspace") {
            this.handleBackspace();
            const btn = this.keyButtons.find((btn) => btn.key === BACKSPACE);
            if (btn) this.animateButton(btn.element);
            return;
        }

        if (key === "enter") {
            this.handleEnter();
            const btn = this.keyButtons.find((btn) => btn.key === ENTER);
            if (btn) this.animateButton(btn.element);
            return;
        }

        // For regular keys, find the button and animate it
        const btn = this.keyButtons.find((btn) => btn.key === key);
        if (btn) {
            this.animateButton(btn.element);
            const character = this.getCharacterForPosition(key);
            if (character && character !== SPACE) {
                this.appendToInput(character);
            } else if (character === SPACE) {
                this.appendToInput(" ");
            }
        }
    }

    private getCharacterForPosition(originalKey: string): string | null {
        const currentLayout = this.currentLayout();

        // Map original key positions to layout positions
        const keyPositionMap = [
            // Row 1: numbers
            ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
            // Row 2: QWERTY top row
            ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
            // Row 3: ASDF row
            ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
            // Row 4: ZXCV row (excluding shift)
            ["\\", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
        ];

        // Find the position of the key
        for (let rowIndex = 0; rowIndex < keyPositionMap.length; rowIndex++) {
            const colIndex = keyPositionMap[rowIndex].indexOf(originalKey);
            if (colIndex !== -1) {
                // Adjust column index for layout (account for shift button in row 4)
                let layoutColIndex = colIndex;
                if (rowIndex === 3) {
                    layoutColIndex = colIndex + 1; // Skip shift button position
                }

                if (currentLayout[rowIndex]?.[layoutColIndex]) {
                    return currentLayout[rowIndex][layoutColIndex];
                }
            }
        }

        // Handle space key specially
        if (originalKey === " ") {
            return SPACE;
        }

        return null;
    }

    private currentLayout(): string[][] {
        const key: LayoutKey = this.isShifted ? (`${this.currentLanguage}_` as LayoutKey) : this.currentLanguage;
        return KEYBOARD_LAYOUTS[key];
    }

    private updateKeyboardDisplay(): void {
        // BUG: probably has a bug somewhere
        const currentLayout = this.currentLayout();

        // Update all key displays with mapped characters
        const keyPositionMap = [
            ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
            ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
            ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
            ["\\", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
        ];

        for (let rowIndex = 0; rowIndex < keyPositionMap.length; rowIndex++) {
            for (let colIndex = 0; colIndex < keyPositionMap[rowIndex].length; colIndex++) {
                const originalKey = keyPositionMap[rowIndex][colIndex];
                const button = this.keyButtons.find((btn) => btn.key === originalKey);

                if (button) {
                    let layoutColIndex = colIndex;
                    if (rowIndex === 3) {
                        layoutColIndex = colIndex + 1; // Account for shift button
                    }

                    const mappedChar = currentLayout[rowIndex]?.[layoutColIndex];
                    const mappedSpan = button.element.querySelector(".key-mapped") as HTMLSpanElement;

                    if (
                        mappedSpan &&
                        mappedChar &&
                        mappedChar !== BACKSPACE &&
                        mappedChar !== ENTER &&
                        mappedChar !== SHIFT &&
                        mappedChar !== SPACE
                    ) {
                        mappedSpan.textContent = mappedChar;
                    }
                }
            }
        }
    }

    private handleShift(): void {
        this.isShifted = !this.isShifted;
        this.updateKeyboardDisplay();
    }

    private handleEnter(): void {
        this.appendToInput("\n");
    }

    private appendToInput(character: string): void {
        this.textInput.value += character;

        // Move cursor to end if input is focused
        if (document.activeElement === this.textInput) {
            this.textInput.setSelectionRange(this.textInput.value.length, this.textInput.value.length);
        }
    }

    private handleBackspace(): void {
        if (this.textInput.value.length > 0) {
            this.textInput.value = this.textInput.value.slice(0, -1);

            // Move cursor to end if input is focused
            if (document.activeElement === this.textInput) {
                this.textInput.setSelectionRange(this.textInput.value.length, this.textInput.value.length);
            }
        }
    }

    private animateButton(button: HTMLButtonElement): void {
        button.classList.add("active");

        setTimeout(() => {
            button.classList.remove("active");
        }, 150);
    }

    resetText() {
        this.textInput.value = "";
    }

    async copyText(): Promise<void> {
        if (this.textInput.value) {
            await navigator.clipboard.writeText(this.textInput.value);
        }
    }

    setLanguage(language: LanguageCode): void {
        this.currentLanguage = language;
        this.isShifted = false; // Reset shift when changing language
        this.updateKeyboardDisplay();
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const app = new KeyboardApp();

    const languagesSubmenu = await Submenu.new({
        text: "Languages",
        items: [
            await MenuItem.new({
                id: "thai",
                text: "Select Thai",
                action: () => {
                    app.setLanguage("TH");
                },
            }),
            await MenuItem.new({
                id: "turkish",
                text: "Select Turkish",
                action: () => {
                    app.setLanguage("TR");
                },
            }),
        ],
    });

    const actionsSubmenu = await Submenu.new({
        text: "Actions",
        items: [
            await MenuItem.new({
                id: "copy",
                text: "Copy",
                action: () => {
                    app.copyText();
                },
            }),
            await MenuItem.new({
                id: "clear",
                text: "Clear",
                action: () => {
                    app.resetText();
                },
            }),
        ],
    });

    const menu = await Menu.new({
        items: [languagesSubmenu, actionsSubmenu],
    });
    menu.setAsAppMenu();
});
