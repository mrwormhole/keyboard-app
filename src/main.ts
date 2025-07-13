import { Menu, MenuItem, Submenu } from "@tauri-apps/api/menu";

type KeyData = {
    key: string;
    element: HTMLButtonElement;
};

const SHIFT = "shift";
const ENTER = "enter";
const BACKSPACE = "backspace";
const SPACE = " ";

class KeyboardApp {
    private textInput: HTMLTextAreaElement;
    private keyButtons: KeyData[];
    private clearButton: HTMLButtonElement;
    private validKeys: string[];

    constructor() {
        this.textInput = document.getElementById("textInput") as HTMLTextAreaElement;
        this.clearButton = document.getElementById("clearButton") as HTMLButtonElement;

        // biome-ignore format: preserve keyboard layout structure
        this.validKeys = [
			'1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', BACKSPACE,
			'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\',
			'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", ENTER,
			SHIFT, '\\', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', SPACE,
		];

        // Initialize key buttons
        this.keyButtons = Array.from(document.querySelectorAll(".key-button")).map((button) => ({
            key: (button as HTMLButtonElement).dataset.key!,
            element: button as HTMLButtonElement,
        }));

        this.initializeEventListeners();
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
                if (key === "backspace") {
                    console.log("registered", key, element);
                    this.handleBackspace();
                    // implement enter click listener later
                    // implement shift click listener later
                } else {
                    this.appendToInput(key);
                }
                this.animateButton(element);
                element.blur();
            });
        });

        // Clear button listener
        this.clearButton.addEventListener("click", () => {
            this.textInput.value = "";
            this.clearButton.blur();
            this.animateButton(this.clearButton);
        });
    }

    private handleKeyPress(key: string): void {
        // Only handle if input is not focused
        if (document.activeElement === this.textInput) {
            return;
        }

        key = key.toLowerCase();
        const btn = this.keyButtons.find((btn) => btn.key === key);
        if (btn == null) {
            return;
        }

        this.animateButton(btn.element);

        if (key === "shift") {
            // implement this later
            return;
        }

        // Handle backspace specially
        if (key === "backspace") {
            this.handleBackspace();
            return;
        }

        if (key === "enter") {
            // implement this later
            return;
        }

        this.appendToInput(key); // this will change
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

    private async copyText(): Promise<void> {
        const textToCopy = this.textInput.value;

        if (textToCopy.length === 0) {
            return;
        }

        await navigator.clipboard.writeText(textToCopy);
        // show feedback
    }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
    const app = new KeyboardApp();

    const languagesSubmenu = await Submenu.new({
        text: "Languages",
        items: [
            await MenuItem.new({
                id: "thai",
                text: "Select Thai",
                action: () => {
                    const clearButton = document.getElementById("clearButton") as HTMLButtonElement;
                    clearButton.style.backgroundColor = "green";
                    console.log("New clicked");
                },
            }),
            await MenuItem.new({
                id: "turkish",
                text: "Select Turkish",
                action: () => {
                    const clearButton = document.getElementById("clearButton") as HTMLButtonElement;
                    clearButton.style.backgroundColor = "purple";
                    console.log("Open clicked");
                },
            }),
        ],
    });

    const menu = await Menu.new({
        items: [languagesSubmenu],
    });
    menu.setAsAppMenu();
});
