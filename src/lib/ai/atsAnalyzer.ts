import { callAi } from "./client";
import { buildSystemPrompt } from "./rag";
import type { AiProviderConfig } from "./types";

export interface AtsCategoryScore {
  name: string;
  score: number;
  status: "good" | "warning" | "error";
  summary: string;
}

export interface AtsImprovement {
  category: string;
  issue: string;
  suggestion: string;
  example?: string;
}

export interface AiAtsAnalysisResult {
  score: number;
  summary: string;
  categories: AtsCategoryScore[];
  strengths: string[];
  improvements: AtsImprovement[];
  detectedKeywords: string[];
  missingKeywords: string[];
}

export async function runAiAtsScan(
  provider: AiProviderConfig,
  markdown: string,
  targetRole?: string,
): Promise<AiAtsAnalysisResult> {
  const prompt = `
Perform a rigorous, professional Applicant Tracking System (ATS) audit of this resume:

Target Role / Domain: ${targetRole || "Extracted from resume or general tech/professional"}

Resume Markdown:
"""
${markdown}
"""

Evaluate across these 4 core ATS criteria:
1. Impact & Metrics Quantification: Does the candidate follow Google's XYZ formula? Are there tangible percentages, revenues, and scale metrics?
2. Action Verbs & Power Phrasing: Are bullets active, punchy, and devoid of passive filler?
3. Keyword & Skill Coverage: Are primary technical/functional keywords naturally placed?
4. Section Structure & ATS Parseability: Are headings, dates, and companies structured unambiguously?

Respond with a single valid JSON object strictly matching this schema:
{
  "score": 85,
  "summary": "Concise 1-2 sentence overall ATS verdict.",
  "categories": [
    {
      "name": "Metrics & Quantification",
      "score": 90,
      "status": "good",
      "summary": "Brief assessment of numbers and results."
    },
    {
      "name": "Action Verbs & Impact",
      "score": 85,
      "status": "good",
      "summary": "Assessment of leadership and active phrasing."
    },
    {
      "name": "Keywords & Domain Skills",
      "score": 80,
      "status": "warning",
      "summary": "Keyword density assessment."
    },
    {
      "name": "Structure & Parseability",
      "score": 95,
      "status": "good",
      "summary": "AST and section layout compliance."
    }
  ],
  "strengths": [
    "Strength 1 with detail",
    "Strength 2 with detail"
  ],
  "improvements": [
    {
      "category": "Metrics",
      "issue": "What is lacking",
      "suggestion": "How to fix it",
      "example": "Before -> After rewrite example"
    }
  ],
  "detectedKeywords": ["TypeScript", "Docker", "AWS", "Kafka"],
  "missingKeywords": ["Kubernetes", "CI/CD", "System Architecture"]
}
`;

  const systemPrompt = buildSystemPrompt({
    taskGoal: "Provide a rigorous numerical ATS audit and return JSON only.",
  });

  const responseText = await callAi(
    provider,
    [
      {
        role: "user",
        content: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON, without preamble.`,
      },
    ],
    {
      systemPrompt,
      temperature: 0.2, // low temperature for consistent scoring
    },
  );

  let cleaned = responseText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  const parsed = JSON.parse(cleaned) as AiAtsAnalysisResult;
  // Ensure score is clamped between 0 and 100
  parsed.score = Math.min(100, Math.max(0, Math.round(parsed.score)));
  return parsed;
}
