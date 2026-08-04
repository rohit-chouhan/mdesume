import { expect, test, describe } from "vitest";
import { analyzeResume } from "../src/lib/analyzer";

describe("Resume Analyzer", () => {
  test("flags missing sections", () => {
    const markdown = `
# John Doe
Software Engineer
    `;
    const result = analyzeResume(markdown);

    const errors = result.feedback.filter(f => f.type === 'error');
    expect(errors.some(e => e.message.includes('Experience'))).toBe(true);
    expect(errors.some(e => e.message.includes('Education'))).toBe(true);
    // Score should be reduced significantly
    expect(result.score).toBeLessThan(80);
  });

  test("rewards good metrics and action verbs", () => {
    const markdown = `
# John Doe
## Experience
* Led a team of 10 engineers to deliver the project 20% faster.
* Developed a scalable backend that saved $5000 monthly.
* Optimized database queries resulting in a 50% performance boost.
## Education
B.S. Computer Science
## Skills
JavaScript, TypeScript, React
    `.repeat(10); // repeat to meet length requirements

    const result = analyzeResume(markdown);

    // Check if score is near perfect
    expect(result.score).toBeGreaterThanOrEqual(95);

    // Check for success feedback on metrics
    const successes = result.feedback.filter(f => f.type === 'success');
    expect(successes.some(s => s.message.includes('metrics'))).toBe(true);
  });

  test("flags passive phrases and lack of metrics", () => {
    const markdown = `
# John Doe
## Experience
* was involved in building the website.
* responsible for updating content.
* helped with deployment.
## Education
B.S.
## Skills
JS
    `.repeat(20);

    const result = analyzeResume(markdown);

    const errors = result.feedback.filter(f => f.type === 'error');
    const warnings = result.feedback.filter(f => f.type === 'warning');

    expect(errors.some(e => e.message.includes('passive phrases'))).toBe(true);
    expect(warnings.some(w => w.message.includes('metrics'))).toBe(true);

    expect(result.score).toBeLessThan(70);
  });

  test("flags cliches", () => {
    const markdown = `
# John Doe
## Experience
* I am a hard worker and a team player who thinks outside the box.
## Education
BS
## Skills
JS
    `.repeat(15);

    const result = analyzeResume(markdown);
    const warnings = result.feedback.filter(f => f.type === 'warning');
    expect(warnings.some(w => w.message.includes('buzzwords'))).toBe(true);
  });

  test("flags grammar mistakes and typos with line numbers", () => {
    const markdown = `
# John Doe
## Experience
* I was the the manager.
* I need to accomodate for this.
* Too  many spaces here.
## Education
BS
## Skills
JS
    `.repeat(10);

    const result = analyzeResume(markdown);

    const errors = result.feedback.filter(f => f.type === 'error');
    const warnings = result.feedback.filter(f => f.type === 'warning');

    // Repeated word check
    expect(warnings.some(w => w.message.includes('the the') && w.line !== undefined)).toBe(true);

    // Typo check
    expect(errors.some(e => e.message.includes('accomodate') && e.line !== undefined)).toBe(true);

    // Double spaces check
    expect(warnings.some(w => w.message.includes('Multiple consecutive spaces') && w.line !== undefined)).toBe(true);
  });
});
