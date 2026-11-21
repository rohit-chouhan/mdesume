import { describe, expect, it } from "vitest";
import { analyzeResume } from "@/lib/analyzer";

const goodResume = `# Rohit Chouhan

## Summary

Senior engineer with a decade of experience.

## Experience

- Led a migration that cut p99 latency by 45%.
- Built a component library adopted by 6 teams, reducing UI code by 60%.
- Automated release checks, cutting defects by 35%.
- Improved throughput by 40% with a new caching layer.
## Education

B.Sc. Computer Science

## Skills

TypeScript, Node.js, React, PostgreSQL, AWS
`;

describe("analyzeResume", () => {
  it("keeps the score within 0–100", () => {
    const result = analyzeResume(goodResume);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("detects missing sections", () => {
    const result = analyzeResume("# Empty\n\nNothing here.");
    const messages = result.feedback.map((item) => item.message).join(" ");
    expect(messages).toMatch(/Experience|Work History/);
    expect(messages).toMatch(/Education/);
  });

  it("flags passive phrases and typos", () => {
    const result = analyzeResume(
      goodResume.replace("- Led a migration", "- Responsible for a migration").replace("Science", "Sciense"),
    );
    const messages = result.feedback.map((item) => item.message).join(" ");
    expect(messages).toMatch(/passive phrase/);
  });

  it("detects a repeated word and reports its line", () => {
    const result = analyzeResume(`${goodResume}\n\nI led led the project.`);
    const repeated = result.feedback.find((item) => item.message.includes("Repeated word"));
    expect(repeated).toBeDefined();
    expect(repeated?.line).toBeGreaterThan(0);
  });

  it("rewards quantified bullets", () => {
    const result = analyzeResume(goodResume);
    expect(result.feedback.some((item) => item.message.includes("quantifiable metrics"))).toBe(true);
  });

  it("warns about buzzwords", () => {
    const result = analyzeResume(`${goodResume}\n\nA proactive team player and thought leader.`);
    expect(result.feedback.some((item) => item.message.includes("buzzwords"))).toBe(true);
  });

  it("produces a better score for a complete resume than an empty one", () => {
    expect(analyzeResume(goodResume).score).toBeGreaterThan(analyzeResume("# Blank").score);
  });
});
