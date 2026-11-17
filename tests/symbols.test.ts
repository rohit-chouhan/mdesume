import { describe, expect, it } from "vitest";
import { SYMBOL_ALIASES, SYMBOLS, SYMBOL_GROUPS } from "@/lib/symbols";

describe("symbol catalogue", () => {
  it("has unique ids", () => {
    expect(new Set(SYMBOLS.map((symbol) => symbol.id)).size).toBe(SYMBOLS.length);
  });

  it("documents every group", () => {
    for (const group of SYMBOL_GROUPS) {
      expect(SYMBOLS.some((symbol) => symbol.group === group)).toBe(true);
    }
  });

  it("has complete documentation for every symbol", () => {
    for (const symbol of SYMBOLS) {
      expect(symbol.name.length, symbol.id).toBeGreaterThan(2);
      expect(symbol.syntax, symbol.id).toMatch(/^::/);
      expect(symbol.description.length, symbol.id).toBeGreaterThan(30);
      expect(symbol.example.length, symbol.id).toBeGreaterThan(5);
      expect(SYMBOL_GROUPS).toContain(symbol.group);
    }
  });

  it("documents the symbols added in this release", () => {
    for (const id of ["page-break", "divider", "badge-inline", "icon", "br"]) {
      expect(SYMBOLS.map((symbol) => symbol.id)).toContain(id);
    }
  });

  it("uses valid alias syntax", () => {
    for (const alias of SYMBOL_ALIASES) {
      expect(alias.alias).toMatch(/^::/);
      expect(alias.canonical).toMatch(/^::/);
    }
  });
});
