import { forwardRef, type CSSProperties } from "react";
import Preview from "./Preview";
import type { ResumeStyles } from "@/lib/db";

/** Pixel equivalents of the supported paper sizes at CSS 96dpi. */
export const PAPER_WIDTH_PX = { A4: 794, Letter: 816 } as const;
export const PAPER_HEIGHT_PX = { A4: 1123, Letter: 1056 } as const;

export function resumeStyleVars(styles: ResumeStyles): CSSProperties {
  const isLetter = styles.pageSize === "Letter";
  return {
    "--resume-h1-color": styles.h1Color,
    "--resume-h2-color": styles.h2Color,
    "--resume-h3-color": styles.h3Color,
    "--resume-text-color": styles.textColor,
    "--resume-link-color": styles.linkColor,
    "--resume-icon-color": styles.iconColor,
    "--resume-h1-size": `${styles.h1Size}pt`,
    "--resume-h2-size": `${styles.h2Size}pt`,
    "--resume-h3-size": `${styles.h3Size}pt`,
    "--resume-text-size": `${styles.textSize}pt`,
    "--resume-font": styles.fontFamily,
    "--resume-padding": styles.padding,
    "--resume-margin": styles.margin,
    "--resume-line-height": styles.lineHeight,
    "--resume-list-cols": String(styles.listColumns),
    "--resume-list-spacing": styles.listSpacing,
    "--resume-section-spacing": styles.sectionSpacing,
    "--resume-text-align": styles.textAlign,
    "--resume-width": isLetter ? "8.5in" : "210mm",
    "--resume-height": isLetter ? "11in" : "297mm",
  } as CSSProperties;
}

export interface ResumeSheetProps {
  markdown: string;
  styles: ResumeStyles;
  className?: string;
  id?: string;
}

/**
 * The printable paper. One element carries the theme class, the CSS variables
 * and the page dimensions so a PDF capture of this node is exactly what the
 * user sees on screen.
 */
const ResumeSheet = forwardRef<HTMLDivElement, ResumeSheetProps>(function ResumeSheet(
  { markdown, styles, className = "", id },
  ref,
) {
  return (
    <div
      ref={ref}
      id={id}
      className={`resume-doc template-${styles.template} ${styles.listColumns > 1 ? "multi-col-lists" : ""} ${className}`.trim()}
      style={resumeStyleVars(styles)}
      data-resume-sheet="true"
    >
      <Preview
        markdown={markdown}
        showLinkIcons={styles.showLinkIcons}
        hideLinkUnderline={styles.hideLinkUnderline}
      />
    </div>
  );
});

export default ResumeSheet;
