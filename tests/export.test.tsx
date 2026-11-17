import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Customizer from "@/components/builder/Customizer";
import ExportMenu from "@/components/builder/ExportMenu";
import { DEFAULT_STYLES } from "@/lib/db";

describe("ExportMenu component", () => {
  it("renders export button and shows both single-page and multi-page PDF options", () => {
    const onPdf = vi.fn();
    const onMarkdown = vi.fn();
    const onBackup = vi.fn();

    render(
      <ExportMenu
        onPdf={onPdf}
        onMarkdown={onMarkdown}
        onBackup={onBackup}
        defaultLayout="single"
      />,
    );

    const exportBtn = screen.getByRole("button", { name: /export/i });
    expect(exportBtn).toBeInTheDocument();

    // Open menu
    fireEvent.click(exportBtn);

    const singleOption = screen.getByText(/Save as PDF \(Single page\)/i);
    const multiOption = screen.getByText(/Save as PDF \(Multi-page\)/i);
    expect(singleOption).toBeInTheDocument();
    expect(multiOption).toBeInTheDocument();

    // Single page has Default badge
    expect(screen.getByText("Default")).toBeInTheDocument();

    // Click single page
    fireEvent.click(singleOption);
    expect(onPdf).toHaveBeenCalledWith("single");
  });

  it("triggers multi-page export when multi-page option is clicked", () => {
    const onPdf = vi.fn();

    render(
      <ExportMenu
        onPdf={onPdf}
        onMarkdown={vi.fn()}
        onBackup={vi.fn()}
        defaultLayout="single"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    fireEvent.click(screen.getByText(/Save as PDF \(Multi-page\)/i));

    expect(onPdf).toHaveBeenCalledWith("paginated");
  });
});

describe("Customizer PDF section", () => {
  it("displays layout selector with single-page and multi-page options", () => {
    const onChange = vi.fn();
    const onDownloadPdf = vi.fn();

    render(
      <Customizer
        styles={DEFAULT_STYLES}
        onChange={onChange}
        metadata={{}}
        onMetadataChange={vi.fn()}
        onOpenTemplates={vi.fn()}
        onDownloadPdf={onDownloadPdf}
        onExportMarkdown={vi.fn()}
        onExportBackup={vi.fn()}
      />,
    );

    const singleLayoutBtn = screen.getByRole("button", { name: /Single page \(large\)/i });
    const multiLayoutBtn = screen.getByRole("button", { name: /Multi-page \(auto\)/i });

    expect(singleLayoutBtn).toBeInTheDocument();
    expect(multiLayoutBtn).toBeInTheDocument();
    expect(singleLayoutBtn).toHaveAttribute("aria-pressed", "true");
    expect(multiLayoutBtn).toHaveAttribute("aria-pressed", "false");

    // Switching layout calls onChange with updated exportFormat
    fireEvent.click(multiLayoutBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ exportFormat: "paginated" }),
    );

    // Primary button triggers download with default layout
    const savePdfBtn = screen.getByRole("button", { name: /Save as PDF \(Single page\)/i });
    fireEvent.click(savePdfBtn);
    expect(onDownloadPdf).toHaveBeenCalledWith("single");
  });

  it("defaults to single page (large) selected even when styles.exportFormat is undefined", () => {
    const onChange = vi.fn();
    const onDownloadPdf = vi.fn();

    render(
      <Customizer
        styles={{ ...DEFAULT_STYLES, exportFormat: undefined as never }}
        onChange={onChange}
        metadata={{}}
        onMetadataChange={vi.fn()}
        onOpenTemplates={vi.fn()}
        onDownloadPdf={onDownloadPdf}
        onExportMarkdown={vi.fn()}
        onExportBackup={vi.fn()}
      />,
    );

    const singleLayoutBtn = screen.getByRole("button", { name: /Single page \(large\)/i });
    expect(singleLayoutBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Single-page PDF setup in print dialog:/i)).toBeInTheDocument();
  });
});
