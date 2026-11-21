import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ShareModal from "@/components/builder/ShareModal";
import { DEFAULT_STYLES, type ResumeData } from "@/lib/db";
import * as shareLib from "@/lib/share";

const mockResume: ResumeData = {
  id: "test-share-1",
  title: "Rohit Chouhan",
  markdown: "# Rohit Chouhan\nStaff Engineer",
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  styles: DEFAULT_STYLES,
};

describe("ShareModal", () => {
  it("does not render when open is false", () => {
    const { container } = render(
      <ShareModal open={false} onClose={() => {}} resume={mockResume} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders share dialog, generates URL and displays QR code", async () => {
    const handleClose = vi.fn();
    render(<ShareModal open={true} onClose={handleClose} resume={mockResume} />);

    expect(screen.getByRole("heading", { name: /share resume/i })).toBeInTheDocument();

    await waitFor(() => {
      const input = screen.getByLabelText(/shareable link/i) as HTMLInputElement;
      expect(input.value).toBeTruthy();
    });

    // Check Done button closes modal
    const doneButton = screen.getByRole("button", { name: /done/i });
    fireEvent.click(doneButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("displays zip1.io short link when available and allows toggling to real URL", async () => {
    const spy = vi.spyOn(shareLib, "generateShareUrl").mockResolvedValue({
      url: "https://mdesume.rohitchouhan.com/builder#share=d:realUrl123",
      shortUrl: "https://zip1.io/mockedShort",
      displayUrl: "https://zip1.io/mockedShort",
      shareHash: "d:realUrl123",
      originalBytes: 200,
      compressedBytes: 100,
      format: "deflate-raw",
    });

    try {
      render(<ShareModal open={true} onClose={() => {}} resume={mockResume} />);

      await waitFor(() => {
        const input = screen.getByLabelText(/shareable link/i) as HTMLInputElement;
        expect(input.value).toBe("https://zip1.io/mockedShort");
      });

      expect(screen.getByText(/shortened with zip1\.io/i)).toBeInTheDocument();

      // Click "Show real URL" button
      const toggleButton = screen.getByRole("button", { name: /show real url/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const input = screen.getByLabelText(/shareable link/i) as HTMLInputElement;
        expect(input.value).toBe("https://mdesume.rohitchouhan.com/builder#share=d:realUrl123");
      });

      expect(screen.getByText(/viewing real direct url/i)).toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });

  it("copies shareable link to clipboard when Copy is clicked", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const handleToast = vi.fn();
    render(
      <ShareModal
        open={true}
        onClose={() => {}}
        resume={mockResume}
        onToast={handleToast}
      />,
    );

    await waitFor(() => {
      const input = screen.getByLabelText(/shareable link/i) as HTMLInputElement;
      expect(input.value).toBeTruthy();
      expect(input.value).not.toContain("Generating");
    });

    const copyButton = screen.getByRole("button", { name: /copy/i });
    expect(copyButton).toBeEnabled();
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
      expect(handleToast).toHaveBeenCalled();
    });
  });
});
