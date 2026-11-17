/**
 * mdesume markdown engine.
 *
 * Resumes are plain GitHub-flavoured Markdown plus a small set of `::directive::`
 * layout symbols. This module turns those symbols into real document nodes so the
 * renderer (and the PDF export) sees a normal tree — nothing leaks as literal
 * `::text::` into the document.
 *
 * Design notes:
 * - Directives are resolved against *blocks*, not raw text. Anything that is not
 *   a directive is left for react-markdown to render normally.
 * - Every opening symbol auto-closes at the next top-level heading or at the end
 *   of the document, so a forgotten `::end-*::` never swallows the rest of the CV.
 * - The inline pass handles `::no-icon::`, `::rating-N::`, `::badge[x]::`,
 *   `::icon[name]::` and `::br::` inside paragraphs, list items and headings.
 */

import qrcode from "qrcode-generator";

export interface MdNode {
  type: string;
  value?: string;
  url?: string;
  alt?: string;
  depth?: number;
  name?: string;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
  children?: MdNode[];
}

export interface MdRoot extends MdNode {
  children: MdNode[];
}

const MONTH =
  "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE = `(?:${MONTH}\\.?\\s+\\d{4}|\\d{1,2}\\/\\d{2,4}|\\d{4}|Present|Current|Now|Ongoing)`;
const DATE_RANGE = `${DATE}(?:\\s*[-–—]\\s*${DATE})?`;

/** Glyphs used by the inline `::icon[name]::` symbol. */
export const INLINE_ICONS: Record<string, string> = {
  mail: "✉",
  email: "✉",
  phone: "☎",
  tel: "☎",
  globe: "🌐",
  web: "🌐",
  link: "🔗",
  location: "📍",
  pin: "📍",
  map: "📍",
  github: "⌥",
  linkedin: "in",
  code: "⌘",
  star: "★",
  check: "✓",
  calendar: "▣",
  clock: "◷",
  download: "↓",
  arrow: "→",
  dot: "•",
  diamond: "◆",
  spark: "✦",
};

// ---------------------------------------------------------------------------
// Directive recognition
// ---------------------------------------------------------------------------

const BLOCK_DIRECTIVE_PATTERNS: RegExp[] = [
  /^::(?:col|cols|columns)(?:-(\d+))?::$/i,
  /^::end-(?:col|cols|columns)::$/i,
  /^::row::$/i,
  /^::end-row::$/i,
  /^::align-(left|center|right|justify)::$/i,
  /^::end-align::$/i,
  /^::badges?::$/i,
  /^::end-badges?::$/i,
  /^::note::$/i,
  /^::end-note::$/i,
  /^::compact::$/i,
  /^::end-compact::$/i,
  /^::no-bullets::$/i,
  /^::end-no-bullets::$/i,
  /^::page-break::$/i,
  /^::divider::$/i,
  /^::height-(\d+)::$/i,
];

/** Inline symbols must stay attached to their paragraph. */
const INLINE_ONLY = /^::(?:no-icons?|rating-[0-5]|(?:badge|pill|tag|icon)\[[^\]]+\]|br)::$/i;

export function isBlockDirective(text: string): boolean {
  const value = text.trim();
  if (!value || INLINE_ONLY.test(value)) return false;
  return BLOCK_DIRECTIVE_PATTERNS.some((re) => re.test(value));
}

const ANY_DIRECTIVE = /::[a-z][\w-]*(?:\[[^\]]*\])?::/gi;

/**
 * Put every block directive on its own paragraph. Handles both
 * `::row::\n### Title` and `::row::**Title**::end-row::` on a single line.
 * Fenced code blocks are never touched.
 */
export function normalizeDirectives(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const expanded: string[] = [];
  let fence: string | null = null;

  for (const line of lines) {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      expanded.push(line);
      continue;
    }
    if (fence !== null) {
      expanded.push(line);
      continue;
    }

    let working = line;
    ANY_DIRECTIVE.lastIndex = 0;
    const tokens = [...line.matchAll(ANY_DIRECTIVE)].map((match) => match[0]);
    for (const token of tokens) {
      if (!isBlockDirective(token)) continue;
      working = working.split(token).join(`\n${token}\n`);
    }
    expanded.push(...working.split("\n"));
  }

  const out: string[] = [];
  for (let i = 0; i < expanded.length; i += 1) {
    const line = expanded[i];
    const directive = isBlockDirective(line);
    const prevBlank = out.length === 0 || out[out.length - 1].trim() === "";

    if (directive && out.length > 0 && !prevBlank) out.push("");
    out.push(line);

    if (directive) {
      const next = expanded[i + 1];
      if (next !== undefined && next.trim() !== "" && !isBlockDirective(next)) {
        out.push("");
      }
    }
  }

  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Row date splitting
// ---------------------------------------------------------------------------

/**
 * Separate a trailing date/range from a title so `::row::` can push it to the
 * right edge. Supports:
 *   "Acme — May 2024 – Present"   "Acme | 07/2021 - 05/2024"
 *   "Acme (2020)"                 "Acme · 2019 – 2021"
 *   "May 2024 – Present"          (date-only row)
 */
export function splitRowDate(value: string): [string, string] | null {
  const text = value.trim();
  if (!text) return null;

  const trailing = new RegExp(`(?:^|\\s)(${DATE_RANGE})$`, "i");
  const parenthesised = new RegExp(`\\s+\\((${DATE_RANGE})\\)$`, "i");
  const separated = new RegExp(`\\s+[-–—|·]\\s+(${DATE_RANGE})$`, "i");

  // Parenthesised dates must win over the generic trailing match, otherwise
  // "Acme (2020)" would leave the opening bracket behind.
  const match = text.match(parenthesised) ?? text.match(trailing) ?? text.match(separated);
  if (!match) return null;

  const date = match[1].trim();
  const dateIndex = match.index === undefined ? -1 : match.index + match[0].indexOf(match[1]);
  if (dateIndex < 0) return null;

  const title = text
    .slice(0, dateIndex)
    .replace(/[\s|·—–(-]+$/, "")
    .trim();

  return [title, date];
}

// ---------------------------------------------------------------------------
// Node helpers
// ---------------------------------------------------------------------------

const text = (value: string): MdNode => ({ type: "text", value });

const container = (
  hName: string,
  className: string,
  children: MdNode[] = [],
  hProperties: Record<string, unknown> = {},
): MdNode => ({
  type: "container",
  data: { hName, hProperties: { className, ...hProperties } },
  children,
});

const collectText = (node: MdNode): string => {
  if (node.type === "text") return node.value ?? "";
  if (node.type === "inlineCode") return node.value ?? "";
  if (Array.isArray(node.children)) return node.children.map(collectText).join("");
  return "";
};

const stripTrailingDate = (node: MdNode, date: string): MdNode => {
  if (node.type === "text" && node.value) {
    return {
      ...node,
      value: node.value
        .replace(date, "")
        .replace(/[\s|·—–-]+$/, "")
        .replace(/\s+$/, ""),
    };
  }
  if (Array.isArray(node.children)) {
    return { ...node, children: node.children.map((child) => stripTrailingDate(child, date)) };
  }
  return node;
};

const dateNode = (date: string): MdNode => container("span", "resume-row-date", [text(date)]);

/** Keep a heading and its following paragraph/link together in multi-column flow. */
function groupColumnItems(children: MdNode[]): MdNode[] {
  const depths = children
    .filter((child) => child.type === "heading" && (child.depth ?? 0) >= 3)
    .map((child) => child.depth as number);
  if (depths.length === 0) return children;

  const minDepth = Math.min(...depths);
  const grouped: MdNode[] = [];
  let current: MdNode[] = [];

  const flush = () => {
    if (current.length === 0) return;
    grouped.push(container("div", "column-item", current));
    current = [];
  };

  for (const child of children) {
    const style = child.data?.hProperties?.style;
    const isSpacer =
      typeof style === "object" && style !== null && Object.hasOwn(style as object, "height");

    if (child.type === "heading" && child.depth === minDepth) {
      flush();
      current.push(child);
    } else if (isSpacer) {
      flush();
      grouped.push(child);
    } else if (current.length > 0) {
      current.push(child);
    } else {
      grouped.push(child);
    }
  }

  flush();
  return grouped;
}

function finalizeColumns(nodes: MdNode[]): void {
  for (const node of nodes) {
    const className = String(node.data?.hProperties?.className ?? "");
    if (node.name === "col" || className.includes("columns-")) {
      // A single transparent wrapper inside a column would break the column flow:
      // merge its class/style onto the column container instead.
      while (
        node.children?.length === 1 &&
        ["no-bullets", "compact", "align"].includes(node.children[0].name ?? "")
      ) {
        const child = node.children[0];
        const childClass = child.data?.hProperties?.className;
        node.data = node.data ?? {};
        node.data.hProperties = node.data.hProperties ?? {};
        if (childClass) {
          node.data.hProperties.className = `${node.data.hProperties.className ?? ""} ${childClass}`.trim();
        }
        const childStyle = child.data?.hProperties?.style;
        if (childStyle) {
          const ownStyle = node.data.hProperties.style;
          node.data.hProperties.style = {
            ...(typeof ownStyle === "object" && ownStyle !== null ? ownStyle : {}),
            ...(childStyle as object),
          };
        }
        node.children = child.children ?? [];
      }
      if (node.children?.length) node.children = groupColumnItems(node.children);
    }
    if (node.children?.length) finalizeColumns(node.children);
  }
}

// ---------------------------------------------------------------------------
// Inline symbols
// ---------------------------------------------------------------------------

function markNoIcon(link: MdNode): void {
  link.data = link.data ?? {};
  link.data.hProperties = link.data.hProperties ?? {};
  link.data.hProperties["data-no-icon"] = "true";
}

function isLink(node: MdNode): boolean {
  return node.type === "link" || node.type === "linkReference";
}

function stripNoIconMarkers(node: MdNode): void {
  if (node.type === "text" && node.value && /::no-icons?::/i.test(node.value)) {
    node.value = node.value.replace(/\s*::no-icons?::\s*/gi, " ");
  }
  for (const child of node.children ?? []) stripNoIconMarkers(child);
}

function handleNoIcons(nodes: MdNode[]): void {
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];

    // Standalone `::no-icon::` targets the first link that follows it.
    if (node.type === "paragraph" && node.children) {
      const onlyText = node.children.every((child) => child.type === "text");
      const value = onlyText ? node.children.map((child) => child.value ?? "").join("").trim() : "";
      if (/^::no-icons?::$/i.test(value)) {
        let marked = false;
        const next = nodes[i + 1];
        const walk = (candidate: MdNode) => {
          if (marked) return;
          if (isLink(candidate)) {
            markNoIcon(candidate);
            marked = true;
            return;
          }
          for (const child of candidate.children ?? []) walk(child);
        };
        if (next) walk(next);
        if (marked) {
          nodes.splice(i, 1);
          i -= 1;
          continue;
        }
      }
    }

    if (!node.children?.length) continue;

    for (let j = 0; j < node.children.length; j += 1) {
      const child = node.children[j];

      // `[::no-icon::Title](url)`
      if (isLink(child)) {
        let marked = false;
        for (const inner of child.children ?? []) {
          if (inner.type === "text" && inner.value && /::no-icons?::/i.test(inner.value)) {
            inner.value = inner.value.replace(/\s*::no-icons?::\s*/gi, " ");
            marked = true;
          }
        }
        if (marked) markNoIcon(child);
      }

      // `::no-icon:: [Title](url)` inside a heading/paragraph/list item
      if (child.type === "text" && child.value && /::no-icons?::/i.test(child.value)) {
        const neighbours = [node.children[j + 1], node.children[j - 1]].filter(Boolean);
        let target = neighbours.find((candidate) => candidate && isLink(candidate));
        if (!target) {
          target = node.children.slice(j + 1).find(isLink);
        }
        if (target) markNoIcon(target);
        child.value = child.value.replace(/\s*::no-icons?::\s*/gi, " ");
      }
    }

    node.children = node.children.filter((child) => !(child.type === "text" && child.value === ""));
    handleNoIcons(node.children);
  }
}

const INLINE_DIRECTIVE_RE =
  /::rating-([0-5])::|::(?:badge|pill|tag)\[([^\]]+)\]::|::icon\[([a-z0-9-]+)\]::|::br::/gi;

function ratingNode(score: number): MdNode {
  const bars = Array.from({ length: 5 }, (_, index) =>
    container("span", `resume-rating-bar${index < score ? " filled" : ""}`),
  );
  return container("span", "resume-rating", bars, {
    "aria-label": `Rating ${score} out of 5`,
    role: "img",
  });
}

function inlineReplacement(source: string, rating?: string, badge?: string, icon?: string): MdNode {
  if (rating) return ratingNode(Number(rating));
  if (badge) return container("span", "resume-badge", [text(badge)]);
  if (icon) {
    const glyph = INLINE_ICONS[icon.toLowerCase()] ?? INLINE_ICONS.dot;
    return container("span", "resume-inline-icon", [text(glyph)], {
      "data-icon": icon.toLowerCase(),
      "aria-hidden": "true",
    });
  }
  if (/^::br::$/i.test(source)) return { type: "break" };
  return text(source);
}

function splitInlineText(value: string): MdNode[] {
  const nodes: MdNode[] = [];
  let cursor = 0;
  INLINE_DIRECTIVE_RE.lastIndex = 0;
  for (const match of value.matchAll(INLINE_DIRECTIVE_RE)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(text(value.slice(cursor, index)));
    nodes.push(inlineReplacement(match[0], match[1], match[2], match[3]));
    cursor = index + match[0].length;
  }
  if (cursor < value.length) nodes.push(text(value.slice(cursor)));
  return nodes.length > 0 ? nodes : [text(value)];
}

function transformInline(parent: MdNode): void {
  if (!parent.children?.length) return;

  const next: MdNode[] = [];
  for (const child of parent.children) {
    if (child.type === "text" && child.value && /::(?:rating-[0-5]|badge\[|pill\[|tag\[|icon\[|br::)/i.test(child.value)) {
      next.push(...splitInlineText(child.value));
      continue;
    }
    transformInline(child);
    next.push(child);
  }

  // Merge adjacent text nodes and drop empties so the tree stays clean.
  const merged: MdNode[] = [];
  for (const node of next) {
    const previous = merged[merged.length - 1];
    if (node.type === "text" && node.value === "") continue;
    if (node.type === "text" && previous?.type === "text") {
      previous.value = `${previous.value ?? ""}${node.value ?? ""}`;
      continue;
    }
    merged.push(node);
  }
  parent.children = merged;
}

// ---------------------------------------------------------------------------
// QR codes
// ---------------------------------------------------------------------------

export function qrDataUrl(value: string): string {
  try {
    const qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();
    return qr.createDataURL(4, 0);
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Main plugin
// ---------------------------------------------------------------------------

type OpenKind = "col" | "align" | "row" | "note" | "compact" | "no-bullets";

interface Opened {
  kind: OpenKind;
  node: MdNode;
}

export function remarkResumeDirectives() {
  return (tree: MdRoot): void => {
    const out: MdNode[] = [];
    const stack: Opened[] = [];

    const append = (node: MdNode) => {
      const top = stack[stack.length - 1];
      if (top) top.node.children?.push(node);
      else out.push(node);
    };

    const open = (kind: OpenKind, node: MdNode) => {
      append(node);
      stack.push({ kind, node });
    };

    const close = (kind: OpenKind) => {
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        if (stack[index].kind === kind) {
          stack.splice(index);
          return;
        }
      }
    };

    const closeAll = () => {
      stack.length = 0;
    };

    const children = tree.children;
    for (let i = 0; i < children.length; i += 1) {
      const node = children[i];

      if (node.type === "paragraph") {
        const value = (node.children ?? [])
          .map((child) => {
            if (child.type === "text") return child.value ?? "";
            if (isLink(child)) return child.url ?? "";
            if (child.type === "inlineCode") return child.value ?? "";
            return child.value ?? "";
          })
          .join("")
          .trim();

        // ---- badges ------------------------------------------------------
        if (/^::badges?::$/i.test(value)) {
          const items: MdNode[] = [];
          let end = -1;
          for (let k = i + 1; k < children.length; k += 1) {
            const candidate = children[k];
            const candidateText = (candidate.children ?? []).map((c) => c.value ?? "").join("").trim();
            if (/^::end-badges?::$/i.test(candidateText)) {
              end = k;
              break;
            }
            if (candidate.type === "heading" || candidate.type === "thematicBreak") break;
            const raw = candidateText;
            if (!raw) continue;
            for (const piece of raw.split(/[,\n·|]/)) {
              const label = piece.trim();
              if (label) items.push(container("span", "resume-badge", [text(label)]));
            }
          }
          if (items.length) append(container("div", "resume-badges", items));
          if (end !== -1) i = end;
          continue;
        }
        if (/^::end-badges?::$/i.test(value)) continue;

        // ---- columns -----------------------------------------------------
        const colMatch = value.match(/^::(?:col|cols|columns)(?:-(\d+))?::$/i);
        if (colMatch) {
          const count = Math.min(4, Math.max(2, Number(colMatch[1] ?? 2)));
          open("col", container("div", `columns-${count}`));
          stack[stack.length - 1].node.name = "col";
          continue;
        }
        if (/^::end-(?:col|cols|columns)::$/i.test(value)) {
          close("col");
          continue;
        }

        // ---- alignment ---------------------------------------------------
        const alignMatch = value.match(/^::align-(left|center|right|justify)::$/i);
        if (alignMatch) {
          const align = alignMatch[1].toLowerCase();
          const alignNode = container("div", `resume-align resume-align-${align}`, [], {
            style: { textAlign: align },
          });
          alignNode.name = "align";
          open("align", alignNode);
          continue;
        }
        if (/^::end-align::$/i.test(value)) {
          close("align");
          continue;
        }

        // ---- rows --------------------------------------------------------
        if (/^::row::$/i.test(value)) {
          const row = container("div", "resume-row");
          row.name = "row";
          open("row", row);
          continue;
        }
        if (/^::end-row::$/i.test(value)) {
          close("row");
          continue;
        }

        // ---- note --------------------------------------------------------
        if (/^::note::$/i.test(value)) {
          const note = container("div", "resume-note");
          note.name = "note";
          open("note", note);
          continue;
        }
        if (/^::end-note::$/i.test(value)) {
          close("note");
          continue;
        }

        // ---- compact -----------------------------------------------------
        if (/^::compact::$/i.test(value)) {
          const compact = container("div", "resume-compact");
          compact.name = "compact";
          open("compact", compact);
          continue;
        }
        if (/^::end-compact::$/i.test(value)) {
          close("compact");
          continue;
        }

        // ---- no bullets --------------------------------------------------
        if (/^::no-bullets::$/i.test(value)) {
          const noBullets = container("div", "resume-no-bullets");
          noBullets.name = "no-bullets";
          open("no-bullets", noBullets);
          continue;
        }
        if (/^::end-no-bullets::$/i.test(value)) {
          close("no-bullets");
          continue;
        }

        // ---- void symbols ------------------------------------------------
        if (/^::page-break::$/i.test(value)) {
          append(container("div", "resume-page-break", [], { "aria-hidden": "true" }));
          continue;
        }
        if (/^::divider::$/i.test(value)) {
          append(container("div", "resume-divider", [], { "aria-hidden": "true" }));
          continue;
        }

        const heightMatch = value.match(/^::height-(\d+)::$/i);
        if (heightMatch) {
          append(
            container("div", "resume-spacer", [], {
              style: {
                height: `${Math.min(400, Math.max(0, Number(heightMatch[1])))}px`,
                width: "100%",
                display: "block",
              },
              "aria-hidden": "true",
            }),
          );
          continue;
        }

        const ratingMatch = value.match(/^::rating-([0-5])::$/i);
        if (ratingMatch) {
          append(ratingNode(Number(ratingMatch[1])));
          continue;
        }

        const avatarMatch = value.match(/^::avatar\[(.+?)\]::$/i);
        if (avatarMatch) {
          append(
            container("img", "resume-avatar", [], {
              src: avatarMatch[1].trim(),
              alt: "Profile photo",
              loading: "lazy",
            }),
          );
          continue;
        }

        const qrMatch = value.match(/^::qr\[(.+?)\]::$/i);
        if (qrMatch) {
          const url = qrMatch[1].trim();
          const dataUrl = qrDataUrl(url);
          if (dataUrl) {
            append(
              container("img", "resume-qr", [], {
                src: dataUrl,
                alt: `QR code linking to ${url}`,
                width: 72,
                height: 72,
              }),
            );
          } else {
            append(
              container("a", "resume-qr-fallback", [text(url)], {
                href: url,
                rel: "noopener noreferrer",
              }),
            );
          }
          continue;
        }
      }

      // A top-level H1/H2 is a new block boundary. A heading that is the first
      // child of an alignment/row container stays inside it (centred name,
      // heading-based rows); columns and notes must never swallow a section.
      if (node.type === "heading" && (node.depth ?? 9) <= 2) {
        const top = stack[stack.length - 1];
        const headingCanOpenContainer =
          !!top &&
          (top.kind === "align" || top.kind === "row") &&
          (top.node.children?.length ?? 0) === 0;
        if (!headingCanOpenContainer) closeAll();
      }

      // `::row::` auto-splits a trailing date so it aligns to the right edge.
      const rowTop = stack[stack.length - 1];
      if (rowTop?.kind === "row" && ["paragraph", "heading", "emphasis", "strong"].includes(node.type)) {
        const fullText = collectText(node).trim();
        const split = fullText ? splitRowDate(fullText) : null;
        if (split) {
          if (split[0] === "") {
            append(dateNode(split[1]));
          } else {
            append(stripTrailingDate(node, split[1]));
            append(dateNode(split[1]));
          }
          continue;
        }
      }

      append(node);
    }

    finalizeColumns(out);
    handleNoIcons(out);
    transformInline({ type: "root", children: out });
    stripNoIconMarkers({ type: "root", children: out });

    // Mark the name heading so every theme can zero its top margin and apply
    // name-specific styling regardless of wrapper containers.
    const markName = (nodes: MdNode[]): boolean => {
      for (const node of nodes) {
        if (node.type === "heading" && node.depth === 1) {
          node.data = node.data ?? {};
          node.data.hProperties = node.data.hProperties ?? {};
          const existing = String(node.data.hProperties.className ?? "");
          node.data.hProperties.className = `${existing} resume-name`.trim();
          return true;
        }
        if (node.type === "container" && node.children?.length) {
          if (markName(node.children)) return true;
        }
      }
      return false;
    };
    markName(out);

    tree.children = out;
  };
}
