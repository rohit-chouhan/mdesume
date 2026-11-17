import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Customizer from "@/components/builder/Customizer";
import { COLOR_PATTERNS } from "@/lib/colorPatterns";
import { DEFAULT_STYLES } from "@/lib/db";

describe("Customizer Color Patterns section", () => {
  it("renders Color patterns section with Default, Random button, and curated palettes", () => {
    const onChange = vi.fn();
    render(
      <Customizer
        styles={DEFAULT_STYLES}
        onChange={onChange}
        metadata={{}}
        onMetadataChange={vi.fn()}
        onOpenTemplates={vi.fn()}
        onDownloadPdf={vi.fn()}
        onExportMarkdown={vi.fn()}
        onExportBackup={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /Color patterns/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Apply random color pattern/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Default color pattern/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /theme color pattern/i })).toBeInTheDocument();

    // Curated patterns exist
    expect(screen.getByRole("button", { name: /Emerald Forest color pattern/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Classic Navy color pattern/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Burgundy Wine color pattern/i })).toBeInTheDocument();
  });

  it("marks Default as active when styles match initial heading and text", () => {
    render(
      <Customizer
        styles={DEFAULT_STYLES}
        onChange={vi.fn()}
        metadata={{}}
        onMetadataChange={vi.fn()}
        onOpenTemplates={vi.fn()}
        onDownloadPdf={vi.fn()}
        onExportMarkdown={vi.fn()}
        onExportBackup={vi.fn()}
      />,
    );

    const defaultBtn = screen.getByRole("button", { name: /Default color pattern/i });
    expect(defaultBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("applies a curated color pattern when clicked", () => {
    const onChange = vi.fn();
    render(
      <Customizer
        styles={DEFAULT_STYLES}
        onChange={onChange}
        metadata={{}}
        onMetadataChange={vi.fn()}
        onOpenTemplates={vi.fn()}
        onDownloadPdf={vi.fn()}
        onExportMarkdown={vi.fn()}
        onExportBackup={vi.fn()}
      />,
    );

    const emeraldPattern = COLOR_PATTERNS.find((p) => p.id === "emerald")!;
    const emeraldBtn = screen.getByRole("button", { name: /Emerald Forest color pattern/i });

    fireEvent.click(emeraldBtn);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        h1Color: emeraldPattern.h1Color,
        h2Color: emeraldPattern.h2Color,
        h3Color: emeraldPattern.h3Color,
        textColor: emeraldPattern.textColor,
        linkColor: emeraldPattern.linkColor,
        iconColor: emeraldPattern.iconColor,
      }),
    );
  });

  it("applies a random color pattern when Random is clicked", () => {
    const onChange = vi.fn();
    render(
      <Customizer
        styles={DEFAULT_STYLES}
        onChange={onChange}
        metadata={{}}
        onMetadataChange={vi.fn()}
        onOpenTemplates={vi.fn()}
        onDownloadPdf={vi.fn()}
        onExportMarkdown={vi.fn()}
        onExportBackup={vi.fn()}
      />,
    );

    const randomBtn = screen.getByRole("button", { name: /Apply random color pattern/i });
    fireEvent.click(randomBtn);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        h1Color: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
        textColor: expect.stringMatching(/^#[0-9a-fA-F]{6}$/),
      }),
    );
  });

  it("restores user's given heading and text when Default is clicked after applying a pattern", () => {
    const customUserStyles = {
      ...DEFAULT_STYLES,
      h1Color: "#123456",
      textColor: "#333333",
    };

    let currentStyles = customUserStyles;
    const onChange = vi.fn((newStyles) => {
      currentStyles = newStyles;
    });

    const { rerender } = render(
      <Customizer
        styles={currentStyles}
        onChange={onChange}
        metadata={{}}
        onMetadataChange={vi.fn()}
        onOpenTemplates={vi.fn()}
        onDownloadPdf={vi.fn()}
        onExportMarkdown={vi.fn()}
        onExportBackup={vi.fn()}
      />,
    );

    // Initial state: Default is active
    expect(screen.getByRole("button", { name: /Default color pattern/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // User applies Emerald pattern
    const emeraldBtn = screen.getByRole("button", { name: /Emerald Forest color pattern/i });
    fireEvent.click(emeraldBtn);

    // Rerender with emerald styles applied
    rerender(
      <Customizer
        styles={currentStyles}
        onChange={onChange}
        metadata={{}}
        onMetadataChange={vi.fn()}
        onOpenTemplates={vi.fn()}
        onDownloadPdf={vi.fn()}
        onExportMarkdown={vi.fn()}
        onExportBackup={vi.fn()}
      />,
    );

    // Default is no longer active, Emerald is active
    expect(screen.getByRole("button", { name: /Default color pattern/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(emeraldBtn).toHaveAttribute("aria-pressed", "true");

    // Click Default button
    const defaultBtn = screen.getByRole("button", { name: /Default color pattern/i });
    fireEvent.click(defaultBtn);

    // It restores user's custom given colors!
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        h1Color: "#123456",
        textColor: "#333333",
      }),
    );
  });

  it("renders Theme Accent card and applies current theme's signature accent", () => {
    const onChange = vi.fn();
    const emeraldStyles = {
      ...DEFAULT_STYLES,
      template: "emerald",
    };

    render(
      <Customizer
        styles={emeraldStyles}
        onChange={onChange}
        metadata={{}}
        onMetadataChange={vi.fn()}
        onOpenTemplates={vi.fn()}
        onDownloadPdf={vi.fn()}
        onExportMarkdown={vi.fn()}
        onExportBackup={vi.fn()}
      />,
    );

    const themeBtn = screen.getByRole("button", { name: /Emerald theme color pattern/i });
    expect(themeBtn).toBeInTheDocument();

    fireEvent.click(themeBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        h1Color: "#047857",
        h2Color: "#047857",
      }),
    );
  });
});
