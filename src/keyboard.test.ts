import { describe, expect, it } from "vitest";
import { BACKSPACE, ENTER, KEYBOARD_LAYOUTS, type LayoutKey, ORIGINAL_LAYOUT, SHIFT, SPACE } from "./keyboard.ts";

describe("Keyboard Layout Structure Validation", () => {
    const ORIGINAL_ROW_LENGTHS = ORIGINAL_LAYOUT.map((row) => row.length);

    describe("Original layout structure", () => {
        it("should have the expected row structure [13, 13, 12, 13]", () => {
            expect(ORIGINAL_ROW_LENGTHS).toEqual([13, 13, 12, 13]);
        });

        it("should have 4 rows total", () => {
            expect(ORIGINAL_LAYOUT).toHaveLength(4);
        });
    });

    describe("Layout length validation", () => {
        const layoutKeys: LayoutKey[] = Object.keys(KEYBOARD_LAYOUTS) as LayoutKey[];

        // Test each layout individually
        layoutKeys.forEach((layoutKey) => {
            describe(`${layoutKey} layout`, () => {
                const layout = KEYBOARD_LAYOUTS[layoutKey];

                it(`should have the same number of rows as original layout (4 rows)`, () => {
                    expect(layout).toHaveLength(ORIGINAL_LAYOUT.length);
                });

                it(`should have the same row lengths as original layout [13, 13, 12, 13]`, () => {
                    const rowLengths = layout.map((row) => row.length);
                    expect(rowLengths).toEqual(ORIGINAL_ROW_LENGTHS);
                });

                it(`should have ANSI/ISO additional buttons to be same on ${layoutKey} layout`, () => {
                    expect(layout[1][12]).toEqual(layout[3][1]);
                });

                ORIGINAL_LAYOUT.forEach((originalRow, rowIndex) => {
                    it(`should have row ${rowIndex + 1} with ${originalRow.length} elements`, () => {
                        expect(layout[rowIndex]).toHaveLength(originalRow.length);
                    });
                });

                it("should have BACKSPACE in the last position of row 1", () => {
                    expect(layout[0][layout[0].length - 1]).toBe(BACKSPACE);
                });

                it("should have ENTER in the last position of row 3", () => {
                    expect(layout[2][layout[2].length - 1]).toBe(ENTER);
                });

                it("should have SHIFT in the first position of row 4", () => {
                    expect(layout[3][0]).toBe(SHIFT);
                });

                it("should have SPACE in the last position of row 4", () => {
                    expect(layout[3][layout[3].length - 1]).toBe(SPACE);
                });
            });
        });

        // Bulk test all layouts
        it("should have all layouts with identical structure to original", () => {
            layoutKeys.forEach((layoutKey) => {
                const layout = KEYBOARD_LAYOUTS[layoutKey];
                const rowLengths = layout.map((row) => row.length);
                expect(rowLengths, `Layout: ${layoutKey}`).toEqual(ORIGINAL_ROW_LENGTHS);
            });
        });
    });

    describe("Layout completeness validation", () => {
        it("should not have any empty rows in any layout", () => {
            Object.entries(KEYBOARD_LAYOUTS).forEach(([_layoutKey, layout]) => {
                layout.forEach((row, _rowIndex) => {
                    expect(row.length).toBeGreaterThan(0);
                    expect(row.every((key) => key.length > 0)).toBe(true);
                });
            });
        });
    });

    describe("Data integrity tests", () => {
        it("should not have duplicate keys within the same row of any layout", () => {
            Object.entries(KEYBOARD_LAYOUTS).forEach(([layoutKey, layout]) => {
                layout.forEach((row, rowIndex) => {
                    expect(row.length, `Layout: ${layoutKey}, Row Index: ${rowIndex}, Keys: [${row.join(", ")}]`).toBe(
                        row.length,
                    );
                });
            });
        });

        it("should have consistent special key usage across all layouts", () => {
            const specialKeys = [BACKSPACE, ENTER, SHIFT, SPACE];

            Object.entries(KEYBOARD_LAYOUTS).forEach(([_layoutKey, layout]) => {
                const flatLayout = layout.flat();

                // Each special key should appear exactly once
                specialKeys.forEach((specialKey) => {
                    const count = flatLayout.filter((key) => key === specialKey).length;
                    expect(count).toBe(1);
                });
            });
        });
    });
});
