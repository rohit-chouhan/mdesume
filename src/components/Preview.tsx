import React, { useDeferredValue, useMemo } from 'react';
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Globe, Code, Mail } from "lucide-react";

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const GithubIcon = ({ size = 24, className, style }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);

const LinkedinIcon = ({ size = 24, className, style }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

interface PreviewProps {
  markdown: string;
  listColumns: number;
  template: string;
  showLinkIcons?: boolean;
  hideLinkUnderline?: boolean;
}

interface RemarkNode {
  type: string;
  value?: string;
  url?: string;
  name?: string;
  depth?: number;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
  children?: RemarkNode[];
}

/**
 * Normalize markdown so that every custom `::...::` directive sits on its own
 * block (surrounded by blank lines). The directive parser only recognizes a
 * directive when it is the sole content of a paragraph, so directives that are
 * glued to surrounding content (e.g. "::row::\n### Title — date" or
 * "::row::**Title**::end-row::" on one line) would leak their literal text into
 * the rendered resume and break row/column layouts.
 */
const normalizeDirectives = (markdown: string): string => {
  // Matches block-level directives (::col-N::, ::row::, etc.).
  // Excludes inline modifiers like ::no-icon:: so they remain attached to headings/paragraphs.
  const BLOCK_DIRECTIVE_LINE_RE = /^::(?!no-icons?::)[\w-]+(?:\[[^\]]*\])?::$/i;

  // First, break block directives that are glued inline (no surrounding newlines).
  // Insert a newline between any non-newline char and a block directive, and between
  // a block directive and any following non-newline char.
  let result = markdown.replace(/(.)(::(?!no-icons?::)[\w-]+(?:\[[^\]]*\])?::)/gi, '$1\n$2');
  result = result.replace(/(::(?!no-icons?::)[\w-]+(?:\[[^\]]*\])?::)(.)/gi, '$1\n$2');

  const lines = result.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isDirective = BLOCK_DIRECTIVE_LINE_RE.test(line.trim());
    const nextIsDirective = i < lines.length - 1 && BLOCK_DIRECTIVE_LINE_RE.test(lines[i + 1].trim());

    // Blank line before a directive (and not at the very top)
    if (isDirective && out.length > 0 && out[out.length - 1].trim() !== '') {
      out.push('');
    }

    out.push(line);

    // Blank line after a directive (and not at the very bottom) so the
    // following content becomes its own block.
    if (isDirective && i < lines.length - 1) {
      const next = lines[i + 1];
      if (next.trim() !== '' && !nextIsDirective) {
        out.push('');
      }
    }
  }

  return out.join('\n');
};

// Split a trailing date / separator from a block of text so a `::row::` can
// lay the title on the left and the date on the right. Matches patterns like:
//   "Company — 05/2024 - Present"   "Role | City 05/2024 - Present"
//   "Company (07/2021 - 05/2024)"   "Company — Present"
// Returns [title, date] or null when nothing trailing looks like a date.
const splitRowDate = (value: string): [string, string] | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // 1) Most specific: a full date range glued by a space, e.g.
  //    "Company 05/2024 - Present" or "Company 07/2021 - 05/2024".
  //    Optional leading \s or ^ so a block that IS only the date still matches;
  //    the date itself is captured in group 1.
  const dateMatch = trimmed.match(
    /(?:\s|^)(\d{1,2}\/\d{2,4}(?:\s*[-–]\s*(?:\d{1,2}\/\d{2,4}|Present|Current))?)$/i
  );
  // 2) "Title (date)" e.g. "(07/2021 - 05/2024)".
  const parenMatch = trimmed.match(/\s+\((.*\d.*|Present|Current)\)$/i);
  // 3) "Title — date" or "Title - date" (em dash / hyphen with surrounding spaces).
  const dashMatch = trimmed.match(/\s+[—–-]\s+(.*\d.*|Present|Current)$/i);

  const m = dateMatch || parenMatch || dashMatch;
  if (!m) return null;

  const date = (m[1] ?? m[0]).trim();
  // Compute the actual matched substring (may include a leading space) to
  // slice the title reliably regardless of the optional space group.
  const dateStart = trimmed.search(/\d{1,2}\/\d{2,4}/);
  const dateEnd = m.index !== undefined ? m.index + m[0].length : trimmed.length;
  let title = trimmed.slice(0, dateStart >= 0 ? dateStart : dateEnd).trim();
  // Drop a dangling separator left on the title (e.g. trailing "—" or "-").
  title = title.replace(/[—–-]\s*$/, '').trim();
  // Allow the whole block to be just a date (title empty => date-only row child).
  return [title, date];
};

// Build a right-aligned date span node for a row.
const makeRowDateNode = (date: string) => ({
  type: 'container',
  data: { hName: 'span', hProperties: { className: 'resume-row-date' } },
  children: [{ type: 'text', value: date }],
});

// Helper to group heading-based entries in multi-column layouts into atomic items,
// preventing paragraphs and links from being split across columns or orphaned.
const groupColumnItems = (children: RemarkNode[]): RemarkNode[] => {
  const headingDepths = children
    .filter((c) => c.type === 'heading' && c.depth != null && c.depth >= 3)
    .map((c) => c.depth as number);

  if (headingDepths.length === 0) {
    return children;
  }

  const minDepth = Math.min(...headingDepths);
  const grouped: RemarkNode[] = [];
  let currentGroup: RemarkNode[] = [];

  const flushGroup = () => {
    if (currentGroup.length > 0) {
      grouped.push({
        type: 'container',
        data: {
          hName: 'div',
          hProperties: { className: 'column-item' },
        },
        children: currentGroup,
      });
      currentGroup = [];
    }
  };

  for (const child of children) {
    const isSpacer =
      child.data?.hProperties?.style != null &&
      typeof child.data.hProperties.style === 'object' &&
      'height' in (child.data.hProperties.style as Record<string, unknown>);

    if (child.type === 'heading' && child.depth != null && child.depth === minDepth) {
      flushGroup();
      currentGroup.push(child);
    } else if (isSpacer) {
      flushGroup();
      grouped.push(child);
    } else {
      if (currentGroup.length > 0) {
        currentGroup.push(child);
      } else {
        grouped.push(child);
      }
    }
  }

  flushGroup();
  return grouped;
};

// Inline remark plugin to handle custom directives
const remarkCustomDirectives = () => (tree: RemarkNode) => {
  const stack: RemarkNode[] = [];
  const newChildren: RemarkNode[] = [];

  const currentRow = (): RemarkNode | null =>
    stack.length > 0 && stack[stack.length - 1].name === 'row'
      ? stack[stack.length - 1]
      : null;

  // Recursively collect all text from a node tree.
  const collectText = (n: RemarkNode): string => {
    if (n.type === 'text') return n.value ?? '';
    if (Array.isArray(n.children)) return n.children.map(collectText).join('');
    return '';
  };
  // Recursively strip a trailing substring (the date) from text nodes.
  const stripDate = (n: RemarkNode, date: string): RemarkNode => {
    if (n.type === 'text') {
      return {
        ...n,
        value: n.value
          ?.replace(date, '')
          .replace(/\s+$/, '')
          .replace(/[—–-]\s*$/, '')
          .trim(),
      };
    }
    if (Array.isArray(n.children)) {
      return { ...n, children: n.children.map((c) => stripDate(c, date)) };
    }
    return n;
  };

  const pushToCurrent = (node: RemarkNode) => {
    const row = currentRow();
    if (row) {
      // Inside a ::row::, auto-split a trailing date so it right-aligns.
      // Handle paragraph / heading / em / strong blocks.
      const splittable =
        node.type === 'paragraph' ||
        node.type === 'heading' ||
        node.type === 'em' ||
        node.type === 'strong';
      if (splittable) {
        const fullText = collectText(node).trim();
        const split = fullText ? splitRowDate(fullText) : null;
        if (split) {
          if (split[0] === '') {
            // The whole block is just a date — render it as the right-aligned span.
            row.children!.push(makeRowDateNode(split[1]));
          } else {
            // Title block keeps its original structure but with the date removed.
            const titleNode = stripDate(node, split[1]);
            row.children!.push(titleNode);
            row.children!.push(makeRowDateNode(split[1]));
          }
          return;
        }
      }
    }
    if (stack.length > 0) {
      stack[stack.length - 1].children!.push(node);
    } else {
      newChildren.push(node);
    }
  };

  for (let i = 0; i < tree.children!.length; i++) {
    const node = tree.children![i];

    // Detect custom directives. A directive line may have been autolinked by
    // remark-gfm (e.g. `::avatar[https://...]::`), turning its single text
    // child into a link — so reconstruct the full paragraph text first.
    if (node.type === 'paragraph') {
      const text = (node.children ?? [])
        .map((c) => {
          if (c.type === 'text') return c.value;
          if (c.type === 'link' || c.type === 'linkReference') return c.url ?? '';
          if (c.type === 'delete')
            return (c.children ?? []).map((x) => x.value ?? '').join('') ?? '';
          return c.value ?? '';
        })
        .join('')
        .trim();

      // ::badges:: ... ::end-badges::  (skill pills)
      if (text === '::badges::') {
        let endIdx = -1;
        let raw = '';
        for (let k = i + 1; k < tree.children!.length; k++) {
          const c = tree.children![k];
          const cText = c.type === 'paragraph' && c.children?.[0]?.type === 'text'
            ? (c.children[0].value ?? '').trim()
            : '';
          if (cText === '::end-badges::') { endIdx = k; break; }
          if (c.type === 'paragraph') {
            raw += (c.children?.map((x: RemarkNode) => x.value ?? '').join('') ?? '') + '\n';
          }
        }
        const items = raw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
        const pills = items.map((it) => ({
          type: 'container',
          data: { hName: 'span', hProperties: { className: 'resume-badge' } },
          children: [{ type: 'text', value: it }],
        }));
        const badgeNode = {
          type: 'container',
          data: { hName: 'div', hProperties: { className: 'resume-badges' } },
          children: pills,
        };
        pushToCurrent(badgeNode);
        if (endIdx !== -1) i = endIdx;
        continue;
      }
      if (text === '::end-badges::') continue;

      const colMatch = text.match(/^::col-(\d+)::$/);
      if (colMatch) {
        const colNode = {
          type: 'container',
          name: 'col',
          data: { hName: 'div', hProperties: { className: `columns-${colMatch[1]}` } },
          children: []
        };
        pushToCurrent(colNode);
        stack.push(colNode);
        continue;
      }

      if (text === '::end-col::') {
        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].name === 'col') {
            stack.splice(j);
            break;
          }
        }
        continue;
      }

      const alignMatch = text.match(/^::align-(left|center|right|justify)::$/);
      if (alignMatch) {
        const alignNode = {
          type: 'container',
          name: 'align',
          data: {
            hName: 'div',
            hProperties: {
              className: `resume-align resume-align-${alignMatch[1]}`,
              style: { textAlign: alignMatch[1] },
            },
          },
          children: []
        };
        pushToCurrent(alignNode);
        stack.push(alignNode);
        continue;
      }

      if (text === '::end-align::') {
        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].name === 'align') {
            stack.splice(j);
            break;
          }
        }
        continue;
      }

      // ::row:: ... ::end-row::  (flex row: title ... date)
      if (text === '::row::') {
        const rowNode = {
          type: 'container',
          name: 'row',
          data: { hName: 'div', hProperties: { className: 'resume-row' } },
          children: []
        };
        pushToCurrent(rowNode);
        stack.push(rowNode);
        continue;
      }
      if (text === '::end-row::') {
        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].name === 'row') { stack.splice(j); break; }
        }
        continue;
      }

      // ::note:: ... ::end-note::  (callout box)
      if (text === '::note::') {
        const noteNode = {
          type: 'container',
          name: 'note',
          data: { hName: 'div', hProperties: { className: 'resume-note' } },
          children: []
        };
        pushToCurrent(noteNode);
        stack.push(noteNode);
        continue;
      }
      if (text === '::end-note::') {
        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].name === 'note') { stack.splice(j); break; }
        }
        continue;
      }

      // ::compact:: ... ::end-compact::  (tighten spacing)
      if (text === '::compact::') {
        const compactNode = {
          type: 'container',
          name: 'compact',
          data: { hName: 'div', hProperties: { className: 'resume-compact' } },
          children: []
        };
        pushToCurrent(compactNode);
        stack.push(compactNode);
        continue;
      }
      if (text === '::end-compact::') {
        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].name === 'compact') { stack.splice(j); break; }
        }
        continue;
      }

      // ::no-bullets:: ... ::end-no-bullets::  (render lists without markers)
      if (text === '::no-bullets::') {
        const noBulletsNode = {
          type: 'container',
          name: 'no-bullets',
          data: { hName: 'div', hProperties: { className: 'resume-no-bullets' } },
          children: []
        };
        pushToCurrent(noBulletsNode);
        stack.push(noBulletsNode);
        continue;
      }
      if (text === '::end-no-bullets::') {
        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].name === 'no-bullets') { stack.splice(j); break; }
        }
        continue;
      }

      const heightMatch = text.match(/^::height-(\d+)::$/);
      if (heightMatch) {
        const spacerNode = {
          type: 'container',
          data: { hName: 'div', hProperties: { style: { height: `${heightMatch[1]}px`, width: '100%', display: 'block' } } },
          children: []
        };
        pushToCurrent(spacerNode);
        continue;
      }

      // ::rating-N::  (proficiency bars, N out of 5)
      const ratingMatch = text.match(/^::rating-(\d+)::$/);
      if (ratingMatch) {
        const n = Math.max(0, Math.min(5, parseInt(ratingMatch[1], 10)));
        const bars = Array.from({ length: 5 }, (_, idx) => ({
          type: 'container',
          data: {
            hName: 'span',
            hProperties: { className: `resume-rating-bar${idx < n ? ' filled' : ''}` },
          },
          children: [],
        }));
        const ratingNode = {
          type: 'container',
          data: { hName: 'span', hProperties: { className: 'resume-rating', 'aria-label': `Rating ${n} out of 5` } },
          children: bars,
        };
        pushToCurrent(ratingNode);
        continue;
      }

      // ::avatar[url]::  (profile photo)
      const avatarMatch = text.match(/^::avatar\[(.+?)\]::$/);
      if (avatarMatch) {
        const avatarNode = {
          type: 'container',
          data: {
            hName: 'img',
            hProperties: { src: avatarMatch[1], className: 'resume-avatar', alt: 'Profile photo' },
          },
          children: [],
        };
        pushToCurrent(avatarNode);
        continue;
      }

      // ::qr[url]::  (QR placeholder box linking to url)
      const qrMatch = text.match(/^::qr\[(.+?)\]::$/);
      if (qrMatch) {
        const qrNode = {
          type: 'container',
          data: { hName: 'div', hProperties: { className: 'resume-qr' } },
          children: [
            { type: 'text', value: qrMatch[1] },
          ],
        };
        pushToCurrent(qrNode);
        continue;
      }
    }

    // Stop columns/align on a top-level h1/h2 automatically — BUT only when
    // the container already has content. A heading that is the FIRST child of
    // an open ::align-*:: / ::col:: / etc. belongs INSIDE it (e.g. centering
    // the resume name), so we must not close the container in that case.
    if (node.type === 'heading' && node.depth != null && node.depth <= 2) {
      const top = stack[stack.length - 1];
      if (!top || (top.children?.length ?? 0) > 0) {
        stack.length = 0;
      }
    }

    pushToCurrent(node);
  }

  const finalizeColumns = (nodes: RemarkNode[]) => {
    for (const n of nodes) {
      if (
        n.name === 'col' ||
        (n.data?.hProperties?.className &&
          String(n.data.hProperties.className).includes('columns-'))
      ) {
        // While the single child is a transparent modifier container (no-bullets, compact, align),
        // unwrap it and merge its class/style onto the column container to prevent layout breakage.
        while (
          n.children &&
          n.children.length === 1 &&
          n.children[0].name &&
          ['no-bullets', 'compact', 'align'].includes(n.children[0].name)
        ) {
          const child = n.children[0];
          const childClass = child.data?.hProperties?.className;
          if (childClass) {
            n.data = n.data || {};
            n.data.hProperties = n.data.hProperties || {};
            n.data.hProperties.className = `${n.data.hProperties.className || ''} ${childClass}`.trim();
          }
          if (child.data?.hProperties?.style) {
            n.data = n.data || {};
            n.data.hProperties = n.data.hProperties || {};
            n.data.hProperties.style = {
              ...(typeof n.data.hProperties.style === 'object' && n.data.hProperties.style ? n.data.hProperties.style : {}),
              ...(child.data.hProperties.style as object),
            };
          }
          n.children = child.children || [];
        }

        if (n.children && n.children.length > 0) {
          n.children = groupColumnItems(n.children);
        }
      }
      if (n.children && n.children.length > 0) {
        finalizeColumns(n.children);
      }
    }
  };

  const NO_ICON_RE = /::no-icons?::/gi;

  const processNoIconDirectives = (nodes: RemarkNode[]) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Case 1: Standalone paragraph containing ONLY ::no-icon::, targeting the first link in the next sibling
      if (node.type === 'paragraph' && Array.isArray(node.children)) {
        const hasOnlyText = node.children.every((c) => c.type === 'text');
        const textVal = hasOnlyText
          ? node.children.map((c) => c.value ?? '').join('').trim()
          : '';
        if (/^::no-icons?::$/i.test(textVal) && i + 1 < nodes.length) {
          const nextNode = nodes[i + 1];
          let marked = false;
          const markFirstLink = (n: RemarkNode) => {
            if (marked) return;
            if (n.type === 'link' || n.type === 'linkReference') {
              n.data = n.data || {};
              n.data.hProperties = n.data.hProperties || {};
              n.data.hProperties['data-no-icon'] = 'true';
              marked = true;
              return;
            }
            if (n.children) {
              for (const child of n.children) {
                markFirstLink(child);
                if (marked) break;
              }
            }
          };
          markFirstLink(nextNode);
          if (marked) {
            nodes.splice(i, 1);
            i--;
            continue;
          }
        }
      }

      // Case 2: Process children inside this node (heading, paragraph, listItem, container, link, etc.)
      if (Array.isArray(node.children) && node.children.length > 0) {
        for (let j = 0; j < node.children.length; j++) {
          const child = node.children[j];

          // 2a: ::no-icon:: is inside the link's text: [::no-icon::Title](url)
          if (child.type === 'link' || child.type === 'linkReference') {
            if (Array.isArray(child.children)) {
              for (const inner of child.children) {
                if (inner.type === 'text' && inner.value && NO_ICON_RE.test(inner.value)) {
                  inner.value = inner.value.replace(NO_ICON_RE, '').trim();
                  child.data = child.data || {};
                  child.data.hProperties = child.data.hProperties || {};
                  child.data.hProperties['data-no-icon'] = 'true';
                }
              }
            }
          }

          // 2b: ::no-icon:: is in a text node sibling (e.g. before/after link in heading or paragraph)
          if (child.type === 'text' && child.value && NO_ICON_RE.test(child.value)) {
            let targetLink: RemarkNode | null = null;
            if (
              j + 1 < node.children.length &&
              (node.children[j + 1].type === 'link' || node.children[j + 1].type === 'linkReference')
            ) {
              targetLink = node.children[j + 1];
            } else if (
              j > 0 &&
              (node.children[j - 1].type === 'link' || node.children[j - 1].type === 'linkReference')
            ) {
              targetLink = node.children[j - 1];
            } else {
              for (let k = j + 1; k < node.children.length; k++) {
                if (node.children[k].type === 'link' || node.children[k].type === 'linkReference') {
                  targetLink = node.children[k];
                  break;
                }
              }
            }

            if (targetLink) {
              targetLink.data = targetLink.data || {};
              targetLink.data.hProperties = targetLink.data.hProperties || {};
              targetLink.data.hProperties['data-no-icon'] = 'true';
            }

            // Strip ::no-icon:: from text
            child.value = child.value.replace(NO_ICON_RE, '');
          }
        }

        // Filter out empty text nodes if other children exist
        if (node.children.length > 1) {
          node.children = node.children.filter(
            (c) => !(c.type === 'text' && c.value === '')
          );
        }

        // Recurse into children
        processNoIconDirectives(node.children);
      }
    }
  };

  finalizeColumns(newChildren);
  processNoIconDirectives(newChildren);
  tree.children = newChildren;
};

const PreviewComponent = ({ markdown, listColumns, template, showLinkIcons = true, hideLinkUnderline = true }: PreviewProps) => {
  // Normalizing + re-parsing the whole document is the most expensive work in the
  // app. Deferring it lets React keep the editor responsive during fast typing and
  // drops intermediate renders instead of laying out every keystroke.
  const deferredMarkdown = useDeferredValue(markdown);
  const normalizedMarkdown = useMemo(
    () => normalizeDirectives(deferredMarkdown),
    [deferredMarkdown]
  );
  const remarkPlugins = useMemo(() => [remarkGfm, remarkCustomDirectives], []);

  const components = useMemo<Components>(() => ({
    a: ({ node, href, children, ...props }) => {
      const linkClass = "hover:opacity-80 transition-opacity";
      const linkStyle = {
        color: "var(--resume-link-color, #2563eb)",
        textDecoration: hideLinkUnderline ? "none" : "underline"
      };

      const isNoIcon =
        (props as Record<string, unknown>)['data-no-icon'] === 'true' ||
        (props as Record<string, unknown>)['data-no-icon'] === true ||
        node?.properties?.dataNoIcon === 'true' ||
        node?.properties?.dataNoIcon === true ||
        (node?.properties as Record<string, unknown> | undefined)?.['data-no-icon'] === 'true';

      if (isNoIcon || !showLinkIcons || !href) {
        return <a href={href} {...props} target="_blank" rel="noopener noreferrer" className={linkClass} style={linkStyle}>{children}</a>;
      }

      let Icon: React.ComponentType<IconProps> = Globe;
      if (href.includes('github.com')) Icon = GithubIcon;
      else if (href.includes('linkedin.com')) Icon = LinkedinIcon;
      else if (href.includes('leetcode.com')) Icon = Code;
      else if (href.startsWith('mailto:')) Icon = Mail;

      return (
        <a href={href} {...props} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 align-middle ${linkClass}`} style={linkStyle}>
          <Icon size={12} className="shrink-0 mt-[1px]" style={{ color: "var(--resume-icon-color, #64748b)" }} />
          <span className="leading-none">{children}</span>
        </a>
      );
    }
  }), [showLinkIcons, hideLinkUnderline]);

  return (
    <div
      className={`resume-preview-content template-${template || 'classic'} ${listColumns > 1 ? 'multi-col-lists' : ''}`}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        components={components}
      >
        {normalizedMarkdown}
      </ReactMarkdown>
    </div>
  );
};

export default React.memo(PreviewComponent);
