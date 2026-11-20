import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

if (typeof window !== "undefined") {
  if (!window.CompressionStream && typeof CompressionStream !== "undefined") {
    (window as unknown as { CompressionStream: typeof CompressionStream }).CompressionStream = CompressionStream;
  }
  if (!window.DecompressionStream && typeof DecompressionStream !== "undefined") {
    (window as unknown as { DecompressionStream: typeof DecompressionStream }).DecompressionStream = DecompressionStream;
  }
}

afterEach(() => cleanup());
