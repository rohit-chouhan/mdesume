export interface AnalyzerFeedback {
  type: "error" | "warning" | "success";
  message: string;
  line?: number;
}

export interface AnalyzerResult {
  score: number;
  feedback: AnalyzerFeedback[];
}

const STRONG_VERBS = new Set([
  "led", "developed", "optimized", "architected", "spearheaded", "managed",
  "created", "designed", "implemented", "improved", "increased", "decreased",
  "built", "launched", "delivered", "reduced", "resolved", "transformed",
  "established", "generated", "negotiated", "pioneered", "streamlined",
  "engineered", "automated", "delivered", "shipped", "owned", "scaled",
]);

const WEAK_PHRASES = [
  "responsible for", "helped with", "worked on", "assisted in",
  "duties included", "tasked with", "was involved in",
];

const CLICHES = [
  "team player", "hard worker", "detail-oriented", "detail oriented", "synergy",
  "go-getter", "think outside the box", "self-starter", "results-driven",
  "dynamic", "proactive", "thought leader",
];

const TYPOS: Record<string, string> = {
  teh: "the",
  manger: "manager",
  accomodate: "accommodate",
  definately: "definitely",
  seperate: "separate",
  recieve: "receive",
  occured: "occurred",
  responsability: "responsibility",
  experiance: "experience",
  enviroment: "environment",
  maintainence: "maintenance",
};

export function analyzeResume(markdown: string): AnalyzerResult {
  const feedback: AnalyzerFeedback[] = [];
  let score = 100;

  const lines = markdown.split("\n");
  const plain = markdown.replace(/[#*`_[\]()]/g, " ");
  const words = plain.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount < 200) {
    feedback.push({ type: "error", message: `Resume is too short (${wordCount} words). Aim for at least 300 words.` });
    score -= 15;
  } else if (wordCount > 900) {
    feedback.push({ type: "warning", message: `Resume is quite long (${wordCount} words). Recruiters prefer concise resumes under 900 words.` });
    score -= 10;
  } else {
    feedback.push({ type: "success", message: `Good length (${wordCount} words).` });
  }

  const lowerMarkdown = markdown.toLowerCase();
  let hasExperience = false;
  let hasEducation = false;
  let hasSkills = false;

  let bulletsFound = 0;
  let bulletsWithMetrics = 0;
  let bulletsWithStrongVerbs = 0;
  let weakPhrasesFound = 0;

  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    const lineNumber = index + 1;

    const repeated = line.match(/\b([A-Za-z]{3,})\s+\1\b/i);
    if (repeated) {
      feedback.push({
        type: "warning",
        message: `Repeated word found: "${repeated[1]} ${repeated[1]}".`,
        line: lineNumber,
      });
      score -= 2;
    }

    const lineWords = lower.split(/[\s,.;:!?()[\]{}]+/).filter(Boolean);
    for (const word of lineWords) {
      const suggestion = TYPOS[word];
      if (suggestion) {
        feedback.push({
          type: "error",
          message: `Possible typo: "${word}". Did you mean "${suggestion}"?`,
          line: lineNumber,
        });
        score -= 3;
      }
    }

    if (/\w\s{2,}\w/.test(line.replace(/^\s+/, ""))) {
      feedback.push({
        type: "warning",
        message: "Multiple consecutive spaces found between words.",
        line: lineNumber,
      });
      score -= 1;
    }

    if (lower.startsWith("## ")) {
      if (/experience|work|employment/.test(lower)) hasExperience = true;
      if (/education|academic/.test(lower)) hasEducation = true;
      if (/skill|technolog/.test(lower)) hasSkills = true;
    }

    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      bulletsFound += 1;
      const content = trimmed.slice(2).trim();
      const contentLower = content.toLowerCase();

      if (/\d|%|\$/.test(content)) bulletsWithMetrics += 1;

      const firstWord = contentLower.match(/^[a-z]+/)?.[0];
      if (firstWord && STRONG_VERBS.has(firstWord)) bulletsWithStrongVerbs += 1;

      for (const phrase of WEAK_PHRASES) {
        if (contentLower.includes(phrase)) weakPhrasesFound += 1;
      }
    }
  });

  if (!hasExperience) {
    feedback.push({ type: "error", message: 'Missing an "Experience" or "Work History" section.' });
    score -= 15;
  } else {
    feedback.push({ type: "success", message: "Experience section found." });
  }

  if (!hasEducation) {
    feedback.push({ type: "error", message: 'Missing an "Education" section.' });
    score -= 10;
  } else {
    feedback.push({ type: "success", message: "Education section found." });
  }

  if (!hasSkills) {
    feedback.push({ type: "warning", message: 'Consider adding a dedicated "Skills" section for quick scanning.' });
    score -= 5;
  } else {
    feedback.push({ type: "success", message: "Skills section found." });
  }

  if (bulletsFound > 0) {
    const metricsRatio = bulletsWithMetrics / bulletsFound;
    if (metricsRatio < 0.3) {
      feedback.push({
        type: "warning",
        message: `Only ${Math.round(metricsRatio * 100)}% of your bullet points contain quantifiable metrics. Add numbers where you can.`,
      });
      score -= 10;
    } else {
      feedback.push({ type: "success", message: "Great use of quantifiable metrics in your experience." });
    }

    if (weakPhrasesFound > 0) {
      feedback.push({
        type: "error",
        message: `Found ${weakPhrasesFound} passive phrase${weakPhrasesFound === 1 ? "" : "s"} (like "responsible for"). Replace them with strong action verbs.`,
      });
      score -= weakPhrasesFound * 2;
    }

    const verbsRatio = bulletsWithStrongVerbs / bulletsFound;
    if (verbsRatio < 0.4) {
      feedback.push({
        type: "warning",
        message: 'Many bullet points do not start with a strong action verb (e.g. "Led", "Built").',
      });
      score -= 5;
    }
  } else if (hasExperience) {
    feedback.push({
      type: "warning",
      message: "No bullet points found. Use bullet points rather than paragraphs for better readability.",
    });
    score -= 10;
  }

  const clichesFound = CLICHES.filter((cliche) => lowerMarkdown.includes(cliche));
  if (clichesFound.length > 0) {
    feedback.push({
      type: "warning",
      message: `Avoid empty buzzwords: ${clichesFound.map((c) => `"${c}"`).join(", ")}. Show these traits through accomplishments instead.`,
    });
    score -= clichesFound.length * 2;
  }

  return { score: Math.max(0, Math.min(100, score)), feedback };
}
