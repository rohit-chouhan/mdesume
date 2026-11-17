/**
 * Build a download-safe file name.
 *
 * Browsers and operating systems disagree about non-ASCII download names
 * (Chrome falls back to "download" as soon as one is present), so transliterate
 * to plain ASCII: strip accents, normalise typographic punctuation, and drop
 * whatever remains.
 */
export function safeFilename(input: string | undefined, fallback = "resume", extension = ""): string {
  const base = (input ?? "").trim() || fallback;
  const slug = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*[—–]\s*/g, "-")
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[_-]+|[_-]+$/g, "");
  const suffix = extension ? (extension.startsWith(".") ? extension : `.${extension}`) : "";
  return `${slug || fallback}${suffix}`;
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
