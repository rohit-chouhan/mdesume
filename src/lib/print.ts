/**
 * Native "Save as PDF" through the browser's print dialog.
 *
 * Supports two layout modes:
 * - "single": Saves the resume as a single continuous large PDF page matching the exact
 *   aspect ratio and scale of the live preview (unscaled 1:1, no page breaks). This is the default.
 * - "paginated": Splits the resume into multiple standard A4 or Letter sheets with
 *   automatic page breaks and ::page-break:: support (full-page auto print).
 *
 * The resume is cloned into a print-only root on the page, the app chrome is
 * hidden with an injected `@media print` block, and `window.print()` is called
 * directly. No pop-up window and no iframe are involved.
 */

const PAGE_SIZE_CSS = {
  A4: "A4",
  Letter: "Letter",
} as const;

export type PrintPageSize = keyof typeof PAGE_SIZE_CSS;
export type PrintLayout = "single" | "paginated";

export interface PrintDimensions {
  width: string;
  height: string;
  sizeCss: string;
  scale: number;
}

export function calculatePrintDimensions(
  pageSize: PrintPageSize,
  layout: PrintLayout = "single",
  contentHeightPx?: number,
): PrintDimensions {
  const isLetter = pageSize === "Letter";
  const paperWidthPx = isLetter ? 816 : 794;
  const standardHeightPx = isLetter ? 1056 : 1123;
  const baseWidthStr = isLetter ? "8.5in" : "210mm";
  const baseHeightStr = isLetter ? "11in" : "297mm";

  if (layout === "paginated") {
    return {
      width: baseWidthStr,
      height: baseHeightStr,
      sizeCss: PAGE_SIZE_CSS[pageSize],
      scale: 1,
    };
  }

  // Single page mode: if content fits standard page, use standard dimensions
  if (!contentHeightPx || contentHeightPx <= standardHeightPx) {
    return {
      width: baseWidthStr,
      height: baseHeightStr,
      sizeCss: `${baseWidthStr} ${baseHeightStr}`,
      scale: 1,
    };
  }

  if (isLetter) {
    const heightIn = (contentHeightPx * 8.5) / paperWidthPx;
    const targetHeightIn = Math.ceil(heightIn * 100) / 100 + 0.05;
    const heightStr = `${targetHeightIn.toFixed(2)}in`;
    return {
      width: "8.5in",
      height: heightStr,
      sizeCss: `8.5in ${heightStr}`,
      scale: 1,
    };
  }

  // A4
  const heightMm = (contentHeightPx * 210) / paperWidthPx;
  const targetHeightMm = Math.ceil(heightMm) + 1;
  const heightStr = `${targetHeightMm}mm`;
  return {
    width: "210mm",
    height: heightStr,
    sizeCss: `210mm ${heightStr}`,
    scale: 1,
  };
}

export function printPageSize(
  pageSize: PrintPageSize,
  layout: PrintLayout = "paginated",
  contentHeightPx?: number,
): string {
  return calculatePrintDimensions(pageSize, layout, contentHeightPx).sizeCss;
}

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

const waitForImages = (root: ParentNode): Promise<void> =>
  Promise.all(
    Array.from(root.querySelectorAll("img")).map((image) =>
      image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  ).then(() => undefined);

export function printStyles({
  pageSize,
  layout = "single",
  contentHeightPx,
}: {
  pageSize: PrintPageSize;
  layout?: PrintLayout;
  contentHeightPx?: number;
}): string {
  const { sizeCss } = calculatePrintDimensions(pageSize, layout, contentHeightPx);
  const isSingle = layout === "single";

  return `
@media print {
  @page {
    size: ${sizeCss};
    margin: 0;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, html.dark, body, body.dark {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    display: block !important;
    overflow: visible !important;
    color-scheme: light !important;
    background: #ffffff !important;
    background-color: #ffffff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Only the clean resume copy is printed. */
  body > *:not(#resume-print-root) { display: none !important; }

  #resume-print-root {
    display: block !important;
    position: static !important;
    left: auto !important;
    top: auto !important;
    visibility: visible !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    background: #ffffff !important;
    background-color: #ffffff !important;
    color-scheme: light !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: ${isSingle ? "hidden" : "visible"} !important;
  }

  /* Matches preview size and styling exactly at natural 1:1 scale */
  #resume-print-root .resume-doc {
    position: static !important;
    inset: auto !important;
    transform: none !important;
    zoom: normal !important;
    box-shadow: none !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    min-height: 0 !important;
    background: #ffffff !important;
    background-color: #ffffff !important;
    overflow: ${isSingle ? "hidden" : "visible"} !important;
  }

  #resume-print-root .resume-doc,
  #resume-print-root .resume-doc * {
    visibility: visible !important;
  }

  ${
    isSingle
      ? `
  /* Single-page mode: disable page breaks and turn ::page-break:: into a subtle divider */
  .resume-page-break {
    break-after: auto !important;
    page-break-after: auto !important;
    break-before: auto !important;
    page-break-before: auto !important;
    height: 0 !important;
    margin: var(--resume-margin, 0.75rem) 0 !important;
    border-top: 1px solid color-mix(in srgb, var(--resume-h2-color, #374151) 28%, white) !important;
  }
`
      : `
  .resume-page-break {
    break-after: page;
    page-break-after: always;
  }

  #resume-print-root h1,
  #resume-print-root h2,
  #resume-print-root h3,
  #resume-print-root h4,
  #resume-print-root .resume-row,
  #resume-print-root li {
    break-inside: avoid;
    page-break-inside: avoid;
  }
`
  }

  #resume-print-root a { text-decoration: none; }
}
`;
}

export interface PrintResumeOptions {
  element: HTMLElement;
  /** Used as the document title, which becomes the PDF's title. */
  title: string;
  pageSize: PrintPageSize;
  layout?: PrintLayout;
}

export async function printResume({
  element,
  title,
  pageSize,
  layout = "single",
}: PrintResumeOptions): Promise<void> {
  const previousTitle = document.title;

  document.getElementById("resume-print-root")?.remove();
  document.getElementById("resume-print-style")?.remove();

  const root = document.createElement("div");
  root.id = "resume-print-root";
  root.setAttribute("aria-hidden", "true");
  root.className = `print-layout-${layout}`;

  // Keep off-screen while measuring unscaled layout and loading assets
  root.style.position = "fixed";
  root.style.left = "-99999px";
  root.style.top = "0";
  root.style.width = pageSize === "Letter" ? "8.5in" : "210mm";
  root.style.visibility = "hidden";
  root.style.display = "block";
  root.style.margin = "0";
  root.style.padding = "0";
  root.style.background = "#ffffff";

  root.appendChild(element.cloneNode(true));
  document.body.appendChild(root);

  document.title = title.trim() || previousTitle;

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.title = previousTitle;
    root.remove();
    document.getElementById("resume-print-style")?.remove();
    window.removeEventListener("afterprint", cleanup);
  };

  try {
    // Fonts are already loaded for the preview; images come from the same cache.
    await Promise.race([
      Promise.all([document.fonts?.ready ?? Promise.resolve(), waitForImages(root)]).then(() => undefined),
      new Promise<void>((resolve) => setTimeout(resolve, 2000)),
    ]);
    await nextFrame();

    // Measure the exact unscaled rendered height of the resume document clone
    const doc = root.querySelector<HTMLElement>(".resume-doc") ?? (root.firstElementChild as HTMLElement | null);
    const measuredHeight = Math.max(
      doc?.scrollHeight ?? 0,
      doc?.offsetHeight ?? 0,
      Math.ceil(doc?.getBoundingClientRect().height ?? 0),
      element?.scrollHeight ?? 0,
      element?.offsetHeight ?? 0,
    );

    const style = document.createElement("style");
    style.id = "resume-print-style";
    style.textContent = printStyles({
      pageSize,
      layout,
      contentHeightPx: measuredHeight,
    });
    document.head.appendChild(style);

    await nextFrame();
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
  } catch (error) {
    cleanup();
    throw error;
  }

  // Some browsers never fire afterprint; never leave a stale print root behind.
  window.setTimeout(cleanup, 120_000);
}
