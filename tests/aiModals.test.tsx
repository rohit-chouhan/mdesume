import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AiChatDrawer from "@/components/ai/AiChatDrawer";
import AiGenerateModal from "@/components/ai/AiGenerateModal";
import AiImproveModal from "@/components/ai/AiImproveModal";
import AiSettingsModal from "@/components/ai/AiSettingsModal";
import AnalyzerModal from "@/components/builder/AnalyzerModal";
import { saveAiProvider } from "@/lib/ai/storage";

describe("AI Modals & Components", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("AiSettingsModal", () => {
    it("renders empty state and allows adding a provider", () => {
      render(<AiSettingsModal open={true} onClose={() => {}} />);
      expect(screen.getByRole("heading", { name: /ai provider settings/i })).toBeInTheDocument();
      expect(screen.getByText(/no ai providers configured/i)).toBeInTheDocument();

      // Click Add Provider
      const addBtn = screen.getByRole("button", { name: /add provider/i });
      fireEvent.click(addBtn);

      expect(screen.getByText(/select provider type/i)).toBeInTheDocument();
      expect(screen.getByText(/extended thinking \/ deep reasoning/i)).toBeInTheDocument();
      expect(screen.getByText(/default: off/i)).toBeInTheDocument();
    });

    it("displays existing providers and indicates active one", () => {
      saveAiProvider({
        id: "p1",
        name: "My Custom Claude",
        provider: "anthropic",
        apiKey: "sk-ant-test",
        model: "claude-3-7-sonnet-20250219",
        enableThinking: false,
        createdAt: 1700000000000,
      });

      render(<AiSettingsModal open={true} onClose={() => {}} />);
      expect(screen.getByText("My Custom Claude")).toBeInTheDocument();
      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });
  });

  describe("AiGenerateModal", () => {
    it("renders prompt to connect AI when no provider is saved", () => {
      const handleOpenSettings = vi.fn();
      render(
        <AiGenerateModal
          open={true}
          onClose={() => {}}
          onOpenSettings={handleOpenSettings}
          onCreated={() => {}}
        />,
      );
      expect(screen.getByText(/no ai provider connected/i)).toBeInTheDocument();
      const connectBtn = screen.getByRole("button", { name: /connect ai provider/i });
      fireEvent.click(connectBtn);
      expect(handleOpenSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe("AiImproveModal", () => {
    it("renders improvement modal and shows notice when no provider is connected", () => {
      render(
        <AiImproveModal
          open={true}
          onClose={() => {}}
          markdown="# Test Resume"
          onApplyMarkdown={() => {}}
        />,
      );
      expect(screen.getByRole("heading", { name: /ai resume improvement suggestions/i })).toBeInTheDocument();
      expect(screen.getByText(/connect ai provider for intelligent improvements/i)).toBeInTheDocument();
    });
  });

  describe("AiChatDrawer", () => {
    it("renders chat assistant drawer with welcome message and quick prompts", () => {
      render(
        <AiChatDrawer
          open={true}
          onClose={() => {}}
          markdown="# Test Resume"
          onApplyMarkdown={() => {}}
        />,
      );
      expect(screen.getByRole("heading", { name: /ai resume assistant/i })).toBeInTheDocument();
      expect(screen.getByText(/hello! i'm your mdesume ai resume assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/quantify bullets with xyz metrics/i)).toBeInTheDocument();
    });
  });

  describe("AnalyzerModal with AI integration", () => {
    it("switches tabs between AI ATS Deep Scan and Classic Heuristics", () => {
      render(
        <AnalyzerModal
          open={true}
          onClose={() => {}}
          markdown="# Rohit Chouhan\n\n## Experience\n- Led development"
        />,
      );
      expect(screen.getByText(/ai ats deep scan/i)).toBeInTheDocument();
      expect(screen.getByText(/classic heuristics/i)).toBeInTheDocument();

      // Click Classic Heuristics
      const classicBtn = screen.getByRole("button", { name: /classic heuristics/i });
      fireEvent.click(classicBtn);

      expect(screen.getByText(/detailed feedback/i)).toBeInTheDocument();
    });

    it("displays 0 score when AI scan fails instead of falling back to classic score", async () => {
      saveAiProvider({
        id: "p1",
        name: "Failing Provider",
        provider: "custom",
        apiKey: "",
        baseUrl: "http://failing-endpoint.local",
        model: "custom",
        enableThinking: false,
        createdAt: 1700000000000,
      });

      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

      try {
        render(
          <AnalyzerModal
            open={true}
            onClose={() => {}}
            markdown="# Rohit Chouhan\n\n## Experience\n- Led development"
          />,
        );

        const scoreZero = await screen.findByText("0");
        expect(scoreZero).toBeInTheDocument();
        expect(screen.getByText(/score unavailable/i)).toBeInTheDocument();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
