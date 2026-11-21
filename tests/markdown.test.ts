import { describe, expect, it } from "vitest";
import { splitRowDate } from "@/lib/markdown";
import { SYMBOLS } from "@/lib/symbols";
import { collectClassNames, collectText, findHName, findNodes, parseResume } from "./helpers";

describe("normalizeDirectives / block layouts", () => {
  it("builds columns and keeps their content inside", () => {
    const tree = parseResume(`::col-2::\n- A\n- B\n::end-col::`);
    expect(collectClassNames(tree)).toContain("columns-2");
    const column = findNodes(tree, (node) => node.data?.hProperties?.className === "columns-2")[0];
    expect(column.children).toHaveLength(1);
    expect(column.children?.[0].type).toBe("list");
  });

  it("accepts columns/cols aliases and clamps the count", () => {
    expect(collectClassNames(parseResume(`::columns-3::\n- A\n::end-columns::`))).toContain("columns-3");
    expect(collectClassNames(parseResume(`::cols-2::\n- A\n::end-cols::`))).toContain("columns-2");
    expect(collectClassNames(parseResume(`::col-9::\n- A\n::end-col::`))).toContain("columns-4");
    expect(collectClassNames(parseResume(`::col::\n- A\n::end-col::`))).toContain("columns-2");
  });

  it("handles a directive glued to content", () => {
    const tree = parseResume(`::row::**Northwind** — Senior Engineer::end-row::`);
    const row = findNodes(tree, (node) => node.data?.hProperties?.className === "resume-row")[0];
    expect(row).toBeDefined();
    expect(collectText(row)).toContain("Northwind");
  });

  it("splits a trailing date into a right-aligned node", () => {
    const tree = parseResume(`::row::\n**Northwind Systems** — May 2022 – Present\n::end-row::`);
    const date = findNodes(tree, (node) => node.data?.hProperties?.className === "resume-row-date")[0];
    expect(date).toBeDefined();
    expect(collectText(date)).toBe("May 2022 – Present");
    const title = findNodes(tree, (node) => node.type === "strong")[0];
    expect(collectText(title)).toBe("Northwind Systems");
  });

  it("supports numeric and parenthesised date formats", () => {
    const numeric = parseResume(`::row::\n**Acme** | 07/2021 - 05/2024\n::end-row::`);
    expect(collectText(findNodes(numeric, (n) => n.data?.hProperties?.className === "resume-row-date")[0])).toBe(
      "07/2021 - 05/2024",
    );

    const parenthesised = parseResume(`::row::\nDeloitte (2022 - 2024)\n::end-row::`);
    expect(collectText(findNodes(parenthesised, (n) => n.data?.hProperties?.className === "resume-row-date")[0])).toBe(
      "2022 - 2024",
    );
  });

  it("renders a company heading inside a row", () => {
    const tree = parseResume(`::row::\n### Adidas Marketing — Software Engineer\nMay 2024 – Present\n::end-row::`);
    const row = findNodes(tree, (node) => node.data?.hProperties?.className === "resume-row")[0];
    expect(row.children?.some((child) => child.type === "heading")).toBe(true);
    expect(collectText(row)).toContain("Adidas Marketing");
  });

  it("closes an open column when a top-level section heading appears", () => {
    const tree = parseResume(`::col-2::\n- A\n\n## Experience\n\n- B`);
    const column = findNodes(tree, (node) => node.data?.hProperties?.className === "columns-2")[0];
    expect(collectText(column)).not.toContain("Experience");
  });

  it("keeps a heading that opens an align block (centred name)", () => {
    const tree = parseResume(`::align-center::\n# Rohit Chouhan\n\n_Senior Engineer_\n::end-align::`);
    const align = findNodes(tree, (node) =>
      String(node.data?.hProperties?.className ?? "").includes("resume-align-center"),
    )[0];
    expect(align.children?.some((child) => child.type === "heading" && child.depth === 1)).toBe(true);
    expect(collectClassNames(tree)).toContain("resume-name");
  });

  it("does not swallow the rest of the document when a closing tag is missing", () => {
    const tree = parseResume(`::col-2::\n- A\n\n## Next section\n\nBody text`);
    expect(tree.children?.length).toBeGreaterThanOrEqual(2);
    const column = findNodes(tree, (node) => node.data?.hProperties?.className === "columns-2")[0];
    expect(collectText(column)).toBe("A");
    expect(collectText(tree)).toContain("Body text");
  });

  it("builds badges without leaking markers", () => {
    const tree = parseResume(`::badges::\nTypeScript, React\nNode.js\n::end-badges::`);
    const badges = findNodes(tree, (node) => node.data?.hProperties?.className === "resume-badge");
    expect(badges.map(collectText)).toEqual(["TypeScript", "React", "Node.js"]);
    expect(collectText(tree)).not.toContain("::");
  });

  it("accepts the singular badges alias", () => {
    const tree = parseResume(`::badge::\nOne, Two\n::end-badge::`);
    expect(findNodes(tree, (node) => node.data?.hProperties?.className === "resume-badge")).toHaveLength(2);
  });

  it("wraps notes, compact and no-bullets blocks", () => {
    expect(collectClassNames(parseResume(`::note::\nHi\n::end-note::`))).toContain("resume-note");
    expect(collectClassNames(parseResume(`::compact::\nHi\n::end-compact::`))).toContain("resume-compact");
    expect(collectClassNames(parseResume(`::no-bullets::\n- A\n::end-no-bullets::`))).toContain(
      "resume-no-bullets",
    );
  });

  it("supports all four alignments", () => {
    for (const align of ["left", "center", "right", "justify"]) {
      const tree = parseResume(`::align-${align}::\nText\n::end-align::`);
      expect(collectClassNames(tree)).toContain(`resume-align-${align}`);
    }
  });

  it("adds page breaks, dividers and custom spacers", () => {
    expect(collectClassNames(parseResume("::page-break::"))).toContain("resume-page-break");
    expect(collectClassNames(parseResume("::divider::"))).toContain("resume-divider");
    const tree = parseResume("::height-32::");
    const spacer = findNodes(tree, (node) => node.data?.hProperties?.className === "resume-spacer")[0];
    expect(spacer.data?.hProperties?.style).toMatchObject({ height: "32px" });
  });

  it("clamps negative/huge spacer heights", () => {
    const tree = parseResume("::height-9999::");
    const spacer = findNodes(tree, (node) => node.data?.hProperties?.className === "resume-spacer")[0];
    expect(spacer.data?.hProperties?.style).toMatchObject({ height: "400px" });
  });
});

describe("inline symbols", () => {
  it("renders rating bars inline", () => {
    const tree = parseResume(`**TypeScript** ::rating-4::`);
    const rating = findNodes(tree, (node) => node.data?.hProperties?.className === "resume-rating")[0];
    expect(rating).toBeDefined();
    expect(rating.data?.hProperties?.["aria-label"]).toBe("Rating 4 out of 5");
    expect(findNodes(rating, (n) => n.data?.hProperties?.className === "resume-rating-bar filled")).toHaveLength(4);
  });

  it("renders an inline badge", () => {
    const tree = parseResume(`Senior Engineer ::badge[Remote]::`);
    const badge = findNodes(tree, (node) => node.data?.hProperties?.className === "resume-badge")[0];
    expect(collectText(badge)).toBe("Remote");
  });

  it("supports pill and tag aliases", () => {
    expect(collectText(parseResume("::pill[Open]::"))).toBe("Open");
    expect(collectText(parseResume("::tag[Hiring]::"))).toBe("Hiring");
  });

  it("renders an inline icon", () => {
    const tree = parseResume(`::icon[mail]:: rohit@example.com`);
    const icon = findNodes(tree, (node) => node.data?.hProperties?.className === "resume-inline-icon")[0];
    expect(icon).toBeDefined();
    expect(collectText(icon)).toBe("✉");
  });

  it("renders a hard line break", () => {
    const tree = parseResume(`Line one::br::Line two`);
    expect(findNodes(tree, (node) => node.type === "break")).toHaveLength(1);
  });

  it("marks links with ::no-icon:: in every supported position", () => {
    const before = parseResume(`### ::no-icon::[WhatsApp](https://pub.dev/x)`);
    expect(findNodes(before, (node) => node.data?.hProperties?.["data-no-icon"] === "true")).toHaveLength(1);

    const inside = parseResume(`### [::no-icon::WhatsApp](https://pub.dev/x)`);
    expect(findNodes(inside, (node) => node.data?.hProperties?.["data-no-icon"] === "true")).toHaveLength(1);

    const standalone = parseResume(`::no-icon::\n### [WhatsApp](https://pub.dev/x)`);
    expect(findNodes(standalone, (node) => node.data?.hProperties?.["data-no-icon"] === "true")).toHaveLength(1);
  });

  it("does not corrupt whitespace around a no-icon marker", () => {
    const tree = parseResume(`**Bold** ::no-icon::[Link](https://example.com) trailing`);
    expect(collectText(tree)).toBe("Bold Link trailing");
  });

  it("accepts ::no-icons:: as an alias", () => {
    const tree = parseResume(`::no-icons::[Link](https://example.com)`);
    expect(findNodes(tree, (node) => node.data?.hProperties?.["data-no-icon"] === "true")).toHaveLength(1);
  });
});

describe("media symbols", () => {
  it("renders an avatar image", () => {
    const tree = parseResume("::avatar[https://example.com/me.jpg]::");
    const image = findHName(tree, "img")[0];
    expect(image.data?.hProperties).toMatchObject({
      src: "https://example.com/me.jpg",
      className: "resume-avatar",
    });
  });

  it("generates a real QR code data URL", () => {
    const tree = parseResume("::qr[https://example.com]::");
    const image = findHName(tree, "img")[0];
    expect(String(image.data?.hProperties?.src)).toMatch(/^data:image\//);
    expect(image.data?.hProperties).toMatchObject({ className: "resume-qr" });
  });
});

describe("row date parsing", () => {
  it.each([
    ["Acme — May 2024 – Present", "Acme", "May 2024 – Present"],
    ["Acme | 07/2021 - 05/2024", "Acme", "07/2021 - 05/2024"],
    ["Acme (2020)", "Acme", "2020"],
    ["Acme · Sep 2017 – Feb 2020", "Acme", "Sep 2017 – Feb 2020"],
    ["May 2024 – Present", "", "May 2024 – Present"],
  ])("splits %s", (input, title, date) => {
    expect(splitRowDate(input)).toEqual([title, date]);
  });

  it("returns null when there is no date", () => {
    expect(splitRowDate("Acme — Senior Engineer")).toBeNull();
  });
});

describe("documented symbols", () => {
  it("every documented symbol example parses without leaking markers", () => {
    for (const symbol of SYMBOLS) {
      const tree = parseResume(symbol.example);
      const rendered = collectText(tree);
      expect(rendered, `${symbol.id} leaked a directive`).not.toMatch(/::(?:col|row|align|badges?|note|compact|no-bullets|height|rating|avatar|qr|divider|page-break|badge|pill|tag|icon|br|no-icon)/i);
    }
  });

  it("every documented symbol produced at least one node", () => {
    for (const symbol of SYMBOLS) {
      expect(parseResume(symbol.example).children?.length, symbol.id).toBeGreaterThan(0);
    }
  });
});
