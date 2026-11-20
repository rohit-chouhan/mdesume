import qrcode from "qrcode-generator";
import { DEFAULT_STYLES, normalizeStyles, type ResumeData, type ResumeMetadata, type ResumeStyles } from "./db";
import { href } from "./site";

export type CompressionFormat = "deflate-raw" | "brotli" | "gzip";

export interface SharePayload {
  v: 1;
  t: string;
  m: string;
  s?: Partial<ResumeStyles>;
  meta?: ResumeMetadata;
}

export function getCompressionStream(format: string): CompressionStream {
  const CS =
    typeof CompressionStream !== "undefined"
      ? CompressionStream
      : typeof window !== "undefined" && window.CompressionStream
        ? window.CompressionStream
        : (globalThis as unknown as { CompressionStream?: typeof CompressionStream }).CompressionStream;
  if (!CS) {
    throw new Error("CompressionStream is not supported in this environment.");
  }
  return new CS(format as "deflate-raw");
}

export function getDecompressionStream(format: string): DecompressionStream {
  const DS =
    typeof DecompressionStream !== "undefined"
      ? DecompressionStream
      : typeof window !== "undefined" && window.DecompressionStream
        ? window.DecompressionStream
        : (globalThis as unknown as { DecompressionStream?: typeof DecompressionStream }).DecompressionStream;
  if (!DS) {
    throw new Error("DecompressionStream is not supported in this environment.");
  }
  return new DS(format as "deflate-raw");
}

/** Check if Brotli stream compression is supported by the current runtime. */
export function isBrotliSupported(): boolean {
  try {
    getCompressionStream("brotli");
    return true;
  } catch {
    return false;
  }
}

/** Compute the minimal style difference compared to DEFAULT_STYLES. */
export function diffStyles(styles: ResumeStyles): Partial<ResumeStyles> {
  const diff: Partial<ResumeStyles> = {};
  for (const key of Object.keys(styles) as (keyof ResumeStyles)[]) {
    if (key === "metadata") continue;
    if (styles[key] !== DEFAULT_STYLES[key]) {
      // @ts-expect-error key index
      diff[key] = styles[key];
    }
  }
  return diff;
}

/** Restore full ResumeStyles from a partial diff. */
export function restoreStyles(diff: Partial<ResumeStyles> | undefined): ResumeStyles {
  return normalizeStyles(diff);
}

/** Convert binary Uint8Array into URL-safe Base64 (RFC 4648 §5). */
export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Convert URL-safe Base64 string back to binary Uint8Array. */
export function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new ArrayBuffer(len);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Compress a resume into a compact, URL-safe string.
 * Uses deflate-raw by default for 100% universal browser compatibility, or brotli where available.
 */
export async function compressResumeToShareString(
  resume: Pick<ResumeData, "title" | "markdown" | "styles" | "metadata">,
  format: CompressionFormat = "deflate-raw",
): Promise<string> {
  const payload: SharePayload = {
    v: 1,
    t: resume.title,
    m: resume.markdown,
    s: diffStyles(resume.styles),
  };
  if (resume.metadata && Object.values(resume.metadata).some((v) => Boolean(v))) {
    payload.meta = resume.metadata;
  }

  const json = JSON.stringify(payload);
  const stream = getCompressionStream(format);
  const writer = stream.writable.getWriter();
  writer.closed.catch(() => {});
  const readPromise = new Response(stream.readable).arrayBuffer();
  const encoder = new TextEncoder();
  writer.write(encoder.encode(json)).catch(() => {});
  writer.close().catch(() => {});

  const buffer = await readPromise;
  const b64 = bytesToBase64Url(new Uint8Array(buffer));

  const prefix = format === "brotli" ? "b:" : format === "gzip" ? "g:" : "d:";
  return `${prefix}${b64}`;
}

/**
 * Decompress a resume from a shared URL hash or string.
 * Automatically inspects the format prefix (d: deflate-raw, b: brotli, g: gzip).
 */
export async function decompressResumeFromShareString(
  rawInput: string,
): Promise<Omit<ResumeData, "id" | "createdAt" | "updatedAt">> {
  let input = rawInput.trim();
  if (input.startsWith("#")) input = input.slice(1);
  if (input.startsWith("share=")) input = input.slice(6);
  else if (input.startsWith("resume=")) input = input.slice(7);

  let format: CompressionFormat = "deflate-raw";
  let b64 = input;

  if (input.startsWith("b:")) {
    format = "brotli";
    b64 = input.slice(2);
  } else if (input.startsWith("d:")) {
    format = "deflate-raw";
    b64 = input.slice(2);
  } else if (input.startsWith("g:")) {
    format = "gzip";
    b64 = input.slice(2);
  }

  const bytes = base64UrlToBytes(b64);
  const stream = getDecompressionStream(format);
  const writer = stream.writable.getWriter();
  writer.closed.catch(() => {});
  const readPromise = new Response(stream.readable).arrayBuffer();
  writer.write(bytes as unknown as BufferSource).catch(() => {});
  writer.close().catch(() => {});

  const buffer = await readPromise;
  const text = new TextDecoder().decode(buffer);
  const parsed: unknown = JSON.parse(text);

  if (parsed && typeof parsed === "object" && "v" in parsed && (parsed as SharePayload).v === 1) {
    const p = parsed as SharePayload;
    return {
      title: typeof p.t === "string" ? p.t : "Shared resume",
      markdown: typeof p.m === "string" ? p.m : "",
      styles: restoreStyles(p.s),
      metadata: p.meta,
    };
  }

  // Fallback for full object exports
  if (parsed && typeof parsed === "object") {
    if ("resume" in parsed && typeof (parsed as { resume: unknown }).resume === "object") {
      const r = (parsed as { resume: ResumeData }).resume;
      return {
        title: r.title || "Shared resume",
        markdown: r.markdown || "",
        styles: normalizeStyles(r.styles),
        metadata: r.metadata,
      };
    }
    if ("markdown" in parsed && typeof (parsed as { markdown: unknown }).markdown === "string") {
      const r = parsed as Partial<ResumeData>;
      return {
        title: r.title || "Shared resume",
        markdown: r.markdown || "",
        styles: normalizeStyles(r.styles),
        metadata: r.metadata,
      };
    }
  }

  throw new Error("Unrecognized resume share data format.");
}

export interface ShareUrlResult {
  url: string;
  shortUrl: string | null;
  displayUrl: string;
  shareHash: string;
  originalBytes: number;
  compressedBytes: number;
  format: CompressionFormat;
}

/**
 * Attempt to shorten a share URL using zip1.io without requiring an API key.
 * If zip1.io fails, times out, or is offline, returns null so the real URL is used as fallback.
 */
export async function shortenUrlWithZip1(url: string, timeoutMs = 3500): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch("https://zip1.io/api/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (
      data &&
      typeof data === "object" &&
      "short_url" in data &&
      typeof (data as { short_url: unknown }).short_url === "string"
    ) {
      return (data as { short_url: string }).short_url;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a complete shareable URL with the compressed resume in the URL hash.
 * Attempts to create a short link with zip1.io, falling back cleanly to the real URL.
 */
export async function generateShareUrl(
  resume: Pick<ResumeData, "title" | "markdown" | "styles" | "metadata">,
  options?: {
    origin?: string;
    format?: CompressionFormat;
    shorten?: boolean;
  },
): Promise<ShareUrlResult> {
  const format = options?.format ?? "deflate-raw";
  const shareString = await compressResumeToShareString(resume, format);
  const origin =
    options?.origin ||
    (typeof window !== "undefined" ? window.location.origin : "https://mdesume.rohitchouhan.com");
  const url = `${origin}${href("/builder")}#share=${shareString}`;

  let shortUrl: string | null = null;
  if (options?.shorten !== false) {
    shortUrl = await shortenUrlWithZip1(url);
  }

  const originalBytes = new TextEncoder().encode(
    JSON.stringify({
      title: resume.title,
      markdown: resume.markdown,
      styles: resume.styles,
      metadata: resume.metadata,
    }),
  ).byteLength;

  const compressedBytes = shareString.length;

  return {
    url,
    shortUrl,
    displayUrl: shortUrl || url,
    shareHash: shareString,
    originalBytes,
    compressedBytes,
    format,
  };
}

/**
 * Generate a scannable QR Code SVG for the share URL.
 * Returns null if the URL length exceeds the maximum QR capacity (approx. 2.9 KB).
 */
export function generateQrCodeSvg(url: string, margin = 2): string | null {
  try {
    const qr = qrcode(0, "L");
    qr.addData(url);
    qr.make();
    return qr.createSvgTag({ scalable: true, margin });
  } catch {
    return null;
  }
}
