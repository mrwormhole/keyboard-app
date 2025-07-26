import { Menu, MenuItem, Submenu } from "@tauri-apps/api/menu";

import {
    BACKSPACE,
    ENTER,
    KEYBOARD_LAYOUTS,
    type LanguageCode,
    type LayoutKey,
    ORIGINAL_LAYOUT,
    SHIFT,
    SPACE,
} from "./keyboard.ts";

type KeyData = {
    key: string; // Store button's data-key
    element: HTMLButtonElement; // Store button
    originalText: string; // Store button's original text
};

class KeyboardApp {
    private textInput: HTMLTextAreaElement;
    private keyButtons: KeyData[];
    private currentLanguage: LanguageCode;
    private isShifted: boolean;

    constructor() {
        this.textInput = document.getElementById("textInput") as HTMLTextAreaElement;
        this.currentLanguage = "TH";
        this.isShifted = false;

        this.keyButtons = Array.from(document.querySelectorAll(".key-button[data-key]")).map((button) => {
            const element = button as HTMLButtonElement;
            const key = element.dataset.key;
            if (!key) throw new Error("data-key attribute missing despite selector");

            const originalText = element.textContent;
            if (!originalText) throw new Error("button is missing text content");

            return { key, element, originalText };
        });

        this.initializeSpans();
        this.initializeEventListeners();
        this.updateKeyboardDisplay();
    }

    private initializeSpans(): void {
        this.keyButtons.forEach(({ element, originalText, key }) => {
            // Skip special keys that shouldn't show dual characters
            if ([SHIFT, ENTER, BACKSPACE, SPACE].includes(key)) {
                return;
            }

            // Inject dual characters display
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
        // Mouse listener
        this.keyButtons.forEach(({ key, element }) => {
            element.addEventListener("click", (e: MouseEvent) => {
                e.preventDefault();

                if (key === BACKSPACE) {
                    this.handleBackspace();
                } else if (key === SHIFT) {
                    this.handleShift();
                } else if (key === ENTER) {
                    this.handleEnter();
                } else if (key === SPACE) {
                    this.handleSpace();
                } else {
                    const character = this.getMappedChar(key);
                    if (character) {
                        this.appendToInput(character);
                    }
                }

                this.animateButton(element);
                element.blur();
            });
        });

        // Keyboard listener
        document.addEventListener("keydown", (e: KeyboardEvent) => {
            e.preventDefault();
            this.handleKeyPress(e.key);
        });
    }

    private handleKeyPress(pressed_key: string): void {
        pressed_key = pressed_key.toLowerCase();
        if (pressed_key === "shift") {
            this.handleShift();
            const btn = this.keyButtons.find((btn) => btn.key === SHIFT);
            if (btn) this.animateButton(btn.element);
            return;
        }

        if (pressed_key === "backspace") {
            this.handleBackspace();
            const btn = this.keyButtons.find((btn) => btn.key === BACKSPACE);
            if (btn) this.animateButton(btn.element);
            return;
        }

        if (pressed_key === "enter") {
            this.handleEnter();
            const btn = this.keyButtons.find((btn) => btn.key === ENTER);
            if (btn) this.animateButton(btn.element);
            return;
        }

        if (pressed_key === " ") {
            this.handleSpace();
            const btn = this.keyButtons.find((btn) => btn.key === SPACE);
            if (btn) this.animateButton(btn.element);
            return;
        }

        const btn = this.keyButtons.find((btn) => btn.key === pressed_key);
        if (btn) {
            this.animateButton(btn.element);
            const char = this.getMappedChar(pressed_key);
            if (char) {
                this.appendToInput(char);
            }
        }
    }

    private getMappedChar(originalKey: string): string {
        const currentLayout = this.currentLayout();

        for (let i = 0; i < ORIGINAL_LAYOUT.length; i++) {
            const j = ORIGINAL_LAYOUT[i].indexOf(originalKey);
            if (j !== -1) {
                if (currentLayout[i]?.[j]) {
                    return currentLayout[i][j];
                }
            }
        }
        return "";
    }

    private currentLayout(): string[][] {
        const key: LayoutKey = this.isShifted ? (`${this.currentLanguage}_` as LayoutKey) : this.currentLanguage;
        return KEYBOARD_LAYOUTS[key];
    }

    private updateKeyboardDisplay(): void {
        const currentLayout: string[][] = this.currentLayout();

        for (let i = 0; i < ORIGINAL_LAYOUT.length; i++) {
            for (let j = 0; j < ORIGINAL_LAYOUT[i].length; j++) {
                const originalKey = ORIGINAL_LAYOUT[i][j];
                const buttons = this.keyButtons.filter((btn) => btn.key === originalKey);
                buttons.forEach((b) => {
                    const mappedChar: string = currentLayout[i]?.[j];
                    const mappedSpan: HTMLSpanElement = b.element.querySelector(".key-mapped") as HTMLSpanElement;
                    if (mappedChar && mappedSpan) {
                        mappedSpan.textContent = mappedChar;
                    }
                });
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

    private handleSpace(): void {
        this.appendToInput(" ");
    }

    private appendToInput(character: string): void {
        this.textInput.value += character;
    }

    private handleBackspace(): void {
        if (this.textInput.value.length > 0) {
            this.textInput.value = this.textInput.value.slice(0, -1);
        }
    }

    private animateButton(btn: HTMLButtonElement): void {
        btn.classList.add("active");

        setTimeout(() => {
            btn.classList.remove("active");
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

    setLanguage(lc: LanguageCode): void {
        this.currentLanguage = lc;
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
