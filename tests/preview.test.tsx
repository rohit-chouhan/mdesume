import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ResumeSheet from "@/components/ResumeSheet";
import { createSampleStyles, SAMPLE_MARKDOWN } from "@/lib/samples";
import { SYMBOLS } from "@/lib/symbols";

const styles = createSampleStyles({ template: "classic" });

describe("ResumeSheet rendering", () => {
  it("renders the name heading with the resume-name marker", () => {
    const { container } = render(<ResumeSheet markdown={SAMPLE_MARKDOWN} styles={styles} />);
    const heading = container.querySelector("h1");
    expect(heading).toHaveClass("resume-name");
    expect(heading).toHaveTextContent("Alex Morgan");
  });

  it("renders columns, rows and dates from the sample", () => {
    const { container } = render(<ResumeSheet markdown={SAMPLE_MARKDOWN} styles={styles} />);
    expect(container.querySelectorAll(".columns-2").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".resume-row").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".resume-row-date").length).toBeGreaterThan(0);
  });

  it("renders badges from the sample", () => {
    const { container } = render(<ResumeSheet markdown={SAMPLE_MARKDOWN} styles={styles} />);
    const badges = Array.from(container.querySelectorAll(".resume-badge")).map((node) => node.textContent);
    expect(badges).toEqual(expect.arrayContaining(["English", "German", "Spanish"]));
  });

  it("applies theme classes and CSS variables", () => {
    const { container } = render(
      <ResumeSheet markdown={SAMPLE_MARKDOWN} styles={createSampleStyles({ template: "tech" })} />,
    );
    const sheet = container.querySelector(".resume-doc");
    expect(sheet).toHaveClass("template-tech");
    expect(sheet).toHaveAttribute("data-resume-sheet", "true");
    expect((sheet as HTMLElement).style.getPropertyValue("--resume-h1-color")).toBe("#306abb");
  });

  it("adds multi-column list mode when enabled", () => {
    const { container } = render(
      <ResumeSheet markdown={SAMPLE_MARKDOWN} styles={createSampleStyles({ listColumns: 2 })} />,
    );
    expect(container.querySelector(".resume-doc")).toHaveClass("multi-col-lists");
  });

  it("renders platform icons for recognised links and suppresses them for ::no-icon::", () => {
    const markdown = `# Alex
[GitHub](https://github.com/alex)
[LinkedIn](https://linkedin.com/in/alex)
::no-icon::[Plain](https://example.com)
`;
    const { container } = render(<ResumeSheet markdown={markdown} styles={styles} />);
    expect(container.querySelectorAll(".resume-link--icon")).toHaveLength(2);
    const plain = Array.from(container.querySelectorAll("a")).find((link) => link.textContent === "Plain");
    expect(plain).not.toHaveClass("resume-link--icon");
  });

  it("can disable link icons globally", () => {
    const { container } = render(
      <ResumeSheet
        markdown={`# Alex\n[GitHub](https://github.com/alex)`}
        styles={createSampleStyles({ showLinkIcons: false })}
      />,
    );
    expect(container.querySelectorAll(".resume-link--icon")).toHaveLength(0);
  });

  it("never leaks a documented symbol as literal text", () => {
    const markdown = [
      "# Alex Morgan",
      "::badges::",
      "TypeScript, React",
      "::end-badges::",
      "::col-2::",
      "- One",
      "- Two",
      "::end-col::",
      "::row::",
      "**Acme** — May 2024 – Present",
      "::end-row::",
      "**Level** ::rating-3::",
      "Senior ::badge[Remote]::",
      "::icon[mail]:: alex@example.com",
      "::note::",
      "Available soon",
      "::end-note::",
      "::divider::",
      "::height-16::",
    ].join("\n");

    const { container } = render(<ResumeSheet markdown={markdown} styles={styles} />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/::(?:col|row|align|badges?|note|compact|no-bullets|height|rating|badge|icon|divider|page-break)/i);
    expect(container.querySelector(".resume-rating")).toBeInTheDocument();
    expect(container.querySelector(".resume-inline-icon")).toHaveTextContent("✉");
  });

  it.each(SYMBOLS.filter((symbol) => symbol.id !== "avatar").map((symbol) => [symbol.id, symbol.example]))(
    "renders the %s guide example without leaking markers",
    (_id, example) => {
      const { container } = render(<ResumeSheet markdown={example} styles={styles} />);
      expect(container.textContent ?? "").not.toMatch(/::[a-z]/i);
    },
  );
});
