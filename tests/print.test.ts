import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculatePrintDimensions,
  printPageSize,
  printResume,
  printStyles,
} from "@/lib/print";

describe("print setup", () => {
  it("maps paper sizes to CSS page sizes for paginated layout", () => {
    expect(printPageSize("A4")).toBe("A4");
    expect(printPageSize("Letter")).toBe("Letter");
    expect(printPageSize("A4", "paginated")).toBe("A4");
    expect(printPageSize("Letter", "paginated")).toBe("Letter");
  });

  it("calculates single-page dimensions matching preview ratio with minimum standard height", () => {
    expect(printPageSize("A4", "single")).toBe("210mm 297mm");
    expect(printPageSize("Letter", "single")).toBe("8.5in 11in");

    const a4 = calculatePrintDimensions("A4", "single");
    expect(a4.width).toBe("210mm");
    expect(a4.height).toBe("297mm");
    expect(a4.sizeCss).toBe("210mm 297mm");
    expect(a4.scale).toBe(1);

    const letter = calculatePrintDimensions("Letter", "single");
    expect(letter.width).toBe("8.5in");
    expect(letter.height).toBe("11in");
    expect(letter.sizeCss).toBe("8.5in 11in");
    expect(letter.scale).toBe(1);
  });

  it("calculates single-page large dimensions matching preview ratio without shrinking text", () => {
    // 1500px content: (1500 * 210) / 794 = 396.725mm -> ceil + 1 = 398mm
    const a4Large = calculatePrintDimensions("A4", "single", 1500);
    expect(a4Large.width).toBe("210mm");
    expect(a4Large.height).toBe("398mm");
    expect(a4Large.sizeCss).toBe("210mm 398mm");
    expect(a4Large.scale).toBe(1);
    expect(printPageSize("A4", "single", 1500)).toBe("210mm 398mm");

    // 1500px content: (1500 * 8.5) / 816 = 15.625in -> ceil(15.625*100)/100 + 0.05 = 15.68in
    const letterLarge = calculatePrintDimensions("Letter", "single", 1500);
    expect(letterLarge.width).toBe("8.5in");
    expect(letterLarge.height).toBe("15.68in");
    expect(letterLarge.sizeCss).toBe("8.5in 15.68in");
    expect(letterLarge.scale).toBe(1);
    expect(printPageSize("Letter", "single", 1500)).toBe("8.5in 15.68in");
  });

  it("generates single-page print styles that match preview without scaling or page breaks", () => {
    const css = printStyles({ pageSize: "A4", layout: "single", contentHeightPx: 1600 });
    expect(css).toContain("@page {\n    size: 210mm ");
    expect(css).toContain("overflow: hidden !important;");
    expect(css).toContain("break-after: auto !important;");
    expect(css).toContain(".resume-page-break");
  });

  it("generates paginated print styles with page break support", () => {
    const css = printStyles({ pageSize: "A4", layout: "paginated" });
    expect(css).toContain("@page {\n    size: A4;\n    margin: 0;\n  }");
    expect(css).toContain("break-after: page;");
    expect(css).toContain("page-break-after: always;");
    expect(css).toContain("break-inside: avoid;");
  });
});

describe("printResume execution", () => {
  beforeEach(() => {
    vi.spyOn(window, "print").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.getElementById("resume-print-root")?.remove();
    document.getElementById("resume-print-style")?.remove();
  });

  it("defaults to single-page layout matching preview ratio when layout option is omitted", async () => {
    const element = document.createElement("div");
    element.className = "resume-doc";
    element.textContent = "Test Resume";
    document.body.appendChild(element);

    await printResume({
      element,
      title: "Test Resume PDF",
      pageSize: "A4",
    });

    expect(window.print).toHaveBeenCalledTimes(1);
    expect(document.title).toBe("Test Resume PDF");

    const style = document.getElementById("resume-print-style");
    expect(style?.textContent).toContain("size: 210mm 297mm");
    expect(style?.textContent).toContain("color-scheme: light !important;");

    element.remove();
  });

  it("supports paginated layout when requested", async () => {
    const element = document.createElement("div");
    element.className = "resume-doc";
    element.textContent = "Test Resume Paginated";
    document.body.appendChild(element);

    await printResume({
      element,
      title: "Paginated Resume",
      pageSize: "Letter",
      layout: "paginated",
    });

    expect(window.print).toHaveBeenCalledTimes(1);

    const style = document.getElementById("resume-print-style");
    expect(style?.textContent).toContain("size: Letter");

    element.remove();
  });
});
