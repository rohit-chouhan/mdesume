import { describe, expect, it } from "vitest";
import { DEFAULT_STYLES, type ResumeData } from "@/lib/db";
import { SAMPLE_MARKDOWN } from "@/lib/samples";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  compressResumeToShareString,
  decompressResumeFromShareString,
  diffStyles,
  generateQrCodeSvg,
  generateShareUrl,
  isBrotliSupported,
  restoreStyles,
  shortenUrlWithZip1,
} from "@/lib/share";

const mockResume: ResumeData = {
  id: "test-id-123",
  title: "Jane Doe — Senior Architect",
  markdown: SAMPLE_MARKDOWN,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  styles: {
    ...DEFAULT_STYLES,
    template: "emerald",
    h1Color: "#047857",
    textColor: "#0f172a",
    pageSize: "Letter",
    listColumns: 2,
  },
  metadata: {
    title: "Jane Doe Resume",
    author: "Jane Doe",
  },
};

describe("share utility", () => {
  it("encodes and decodes base64url correctly", () => {
    const original = new Uint8Array([0, 255, 128, 42, 64, 18, 99]);
    const b64 = bytesToBase64Url(original);

    // Must be URL-safe: no +, /, or =
    expect(b64).not.toMatch(/[+/=]/);

    const restored = base64UrlToBytes(b64);
    expect(Array.from(restored)).toEqual(Array.from(original));
  });

  it("diffs and restores styles against DEFAULT_STYLES", () => {
    const diff = diffStyles(mockResume.styles);

    // Only non-default styles should be retained
    expect(diff.template).toBe("emerald");
    expect(diff.h1Color).toBe("#047857");
    expect(diff.pageSize).toBe("Letter");
    expect(diff.listColumns).toBe(2);

    // Unmodified styles should not be present in the diff
    expect("fontFamily" in diff).toBe(false);
    expect("lineHeight" in diff).toBe(false);

    // Restoring merges cleanly
    const restored = restoreStyles(diff);
    expect(restored.template).toBe("emerald");
    expect(restored.fontFamily).toBe(DEFAULT_STYLES.fontFamily);
    expect(restored.pageSize).toBe("Letter");
  });

  it("compresses and decompresses resume with deflate-raw", async () => {
    const shareString = await compressResumeToShareString(mockResume, "deflate-raw");

    // Prefix for deflate-raw
    expect(shareString.startsWith("d:")).toBe(true);

    const decompressed = await decompressResumeFromShareString(shareString);
    expect(decompressed.title).toBe(mockResume.title);
    expect(decompressed.markdown).toBe(mockResume.markdown);
    expect(decompressed.styles.template).toBe("emerald");
    expect(decompressed.styles.h1Color).toBe("#047857");
    expect(decompressed.metadata?.author).toBe("Jane Doe");
  });

  it("supports brotli compression if supported by runtime", async () => {
    if (!isBrotliSupported()) {
      // In environments where brotli is not supported, it throws cleanly
      await expect(compressResumeToShareString(mockResume, "brotli")).rejects.toThrow();
      return;
    }

    const shareString = await compressResumeToShareString(mockResume, "brotli");
    expect(shareString.startsWith("b:")).toBe(true);

    const decompressed = await decompressResumeFromShareString(shareString);
    expect(decompressed.title).toBe(mockResume.title);
    expect(decompressed.markdown).toBe(mockResume.markdown);
    expect(decompressed.styles.template).toBe("emerald");
  });

  it("generates share URL with #share= fragment", async () => {
    const result = await generateShareUrl(mockResume, { origin: "https://example.com", shorten: false });

    expect(result.url).toContain("https://example.com/builder#share=d:");
    expect(result.compressedBytes).toBeGreaterThan(0);
    expect(result.originalBytes).toBeGreaterThan(result.compressedBytes);
    expect(result.displayUrl).toBe(result.url);
  });

  it("shortens URL with zip1.io when API succeeds", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ short_url: "https://zip1.io/short123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    try {
      const shortUrl = await shortenUrlWithZip1("https://example.com/long-url");
      expect(shortUrl).toBe("https://zip1.io/short123");

      const result = await generateShareUrl(mockResume, { origin: "https://example.com", shorten: true });
      expect(result.shortUrl).toBe("https://zip1.io/short123");
      expect(result.displayUrl).toBe("https://zip1.io/short123");
      expect(result.url).toContain("https://example.com/builder#share=d:");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("falls back to real URL when zip1.io fails or is offline", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      throw new Error("Network offline");
    };

    try {
      const shortUrl = await shortenUrlWithZip1("https://example.com/long-url");
      expect(shortUrl).toBeNull();

      const result = await generateShareUrl(mockResume, { origin: "https://example.com", shorten: true });
      expect(result.shortUrl).toBeNull();
      expect(result.displayUrl).toBe(result.url);
      expect(result.url).toContain("https://example.com/builder#share=d:");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("generates a scannable QR Code SVG for valid URLs", () => {
    const svg = generateQrCodeSvg("https://mdesume.rohitchouhan.com/builder#share=d:xyz123");
    expect(svg).toBeTruthy();
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("handles decompressed input with prefixes (#share=, share=)", async () => {
    const shareString = await compressResumeToShareString(mockResume);

    const hashInput = `#share=${shareString}`;
    const restored = await decompressResumeFromShareString(hashInput);
    expect(restored.title).toBe(mockResume.title);

    const queryInput = `share=${shareString}`;
    const restoredQuery = await decompressResumeFromShareString(queryInput);
    expect(restoredQuery.title).toBe(mockResume.title);
  });

  it("throws error for corrupted or invalid share strings", async () => {
    await expect(decompressResumeFromShareString("d:not-a-valid-base64")).rejects.toThrow();
  });
});
