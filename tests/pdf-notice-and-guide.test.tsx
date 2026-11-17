import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PdfNoticeModal, { PDF_NOTICE_STORAGE_KEY } from "@/components/builder/PdfNoticeModal";
import { generateGuideMarkdown } from "@/lib/guideMarkdown";
import { THEMES } from "@/lib/themes";

describe("PdfNoticeModal", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("does not render when open is false", () => {
    const { container } = render(
      <PdfNoticeModal open={false} onConfirm={vi.fn()} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders instructions for Destination, Margins, and Background Graphics", () => {
    render(<PdfNoticeModal open={true} onConfirm={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText(/Save as Single-Page PDF/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Save as PDF/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/None/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Background graphics/i).length).toBeGreaterThanOrEqual(1);
  });

  it("calls onConfirm when Continue to Print is clicked", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<PdfNoticeModal open={true} onConfirm={onConfirm} onClose={onClose} />);

    const continueBtn = screen.getByRole("button", { name: /continue to print/i });
    fireEvent.click(continueBtn);

    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalled();
    expect(window.localStorage.getItem(PDF_NOTICE_STORAGE_KEY)).toBeNull();
  });

  it("persists dontShowAgain to localStorage when checked", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<PdfNoticeModal open={true} onConfirm={onConfirm} onClose={onClose} />);

    const checkbox = screen.getByRole("checkbox", { name: /don't show this guide again/i });
    fireEvent.click(checkbox);

    const continueBtn = screen.getByRole("button", { name: /continue to print/i });
    fireEvent.click(continueBtn);

    expect(window.localStorage.getItem(PDF_NOTICE_STORAGE_KEY)).toBe("true");
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<PdfNoticeModal open={true} onConfirm={onConfirm} onClose={onClose} />);

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe("generateGuideMarkdown", () => {
  it("includes instructions for AI, layout symbols, and sample resume", () => {
    const md = generateGuideMarkdown("https://mdesume.test");

    expect(md).toContain("Instructions for AI Assistants");
    expect(md).toContain("::row::");
    expect(md).toContain("::col-2::");
    expect(md).toContain("::badges::");
    expect(md).toContain("::align-center::");
    expect(md).toContain("Alex Morgan");
    expect(md).toContain("https://mdesume.test");
  });

  it("lists all 18 themes in the AI guide", () => {
    const md = generateGuideMarkdown();
    for (const theme of THEMES) {
      expect(md).toContain(theme.name);
    }
  });
});
