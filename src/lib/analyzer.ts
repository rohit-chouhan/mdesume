export interface AnalyzerFeedback {
  type: 'error' | 'warning' | 'success';
  message: string;
  section?: string;
  line?: number;
}

export interface AnalyzerResult {
  score: number;
  feedback: AnalyzerFeedback[];
}

const STRONG_VERBS = [
  'led', 'developed', 'optimized', 'architected', 'spearheaded', 'managed',
  'created', 'designed', 'implemented', 'improved', 'increased', 'decreased',
  'built', 'launched', 'delivered', 'reduced', 'resolved', 'transformed',
  'established', 'generated', 'negotiated', 'pioneered', 'streamlined'
];

const WEAK_PHRASES = [
  'responsible for', 'helped with', 'worked on', 'assisted in', 'duties included',
  'tasked with', 'handled', 'was involved in'
];

const CLICHES = [
  'team player', 'hard worker', 'detail-oriented', 'detail oriented', 'synergy',
  'go-getter', 'think outside the box', 'self-starter', 'results-driven',
  'dynamic', 'proactive', 'thought leader'
];

const TYPOS: Record<string, string> = {
  'teh': 'the',
  'manger': 'manager',
  'accomodate': 'accommodate',
  'definately': 'definitely',
  'seperate': 'separate',
  'recieve': 'receive',
  'occured': 'occurred',
  'responsability': 'responsibility',
  'experiance': 'experience',
  'enviroment': 'environment',
  'maintainence': 'maintenance'
};

export function analyzeResume(markdown: string): AnalyzerResult {
  const feedback: AnalyzerFeedback[] = [];
  let score = 100;

  // Basic cleanup
  const lines = markdown.split('\n');
  const textContent = markdown.replace(/[#*`_\[\]()]/g, ' ');
  const words = textContent.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // 1. Length Check
  if (wordCount < 200) {
    feedback.push({ type: 'error', message: `Resume is too short (${wordCount} words). Aim for at least 300 words.` });
    score -= 15;
  } else if (wordCount > 800) {
    feedback.push({ type: 'warning', message: `Resume is quite long (${wordCount} words). Recruiters prefer concise resumes under 800 words.` });
    score -= 10;
  } else {
    feedback.push({ type: 'success', message: `Good length (${wordCount} words).` });
  }

  // 2. Sections Check
  const lowerMarkdown = markdown.toLowerCase();
  let hasExperience = false;
  let hasEducation = false;
  let hasSkills = false;

  // 3. Bullet Point Analysis (Metrics, Verbs, Weak Phrases)
  let bulletsFound = 0;
  let bulletsWithMetrics = 0;
  let bulletsWithStrongVerbs = 0;
  let weakPhrasesFound = 0;

  lines.forEach((line, index) => {
    const l = line.toLowerCase();
    const lineNumber = index + 1;

    // --- Grammar & Typo Checks ---

    // 1. Repeated Words
    const repeatedWords = line.match(/\b([A-Za-z]+)\s+\1\b/i);
    if (repeatedWords && repeatedWords[1].length > 2) { // Ignore short repeats like "to to" just in case, or keep it.
      feedback.push({
        type: 'warning',
        message: `Repeated word found: "${repeatedWords[1]} ${repeatedWords[1]}".`,
        line: lineNumber
      });
      score -= 2;
    }

    // 2. Common Typos
    const lineWords = l.split(/[\s,.;:!?()[\]{}]+/).filter(w => w.length > 0);
    lineWords.forEach(w => {
      if (TYPOS[w]) {
        feedback.push({
          type: 'error',
          message: `Possible typo: "${w}". Did you mean "${TYPOS[w]}"?`,
          line: lineNumber
        });
        score -= 3;
      }
    });

    // 3. Double spaces between words
    if (/\w\s{2,}\w/.test(line)) {
      feedback.push({
        type: 'warning',
        message: `Multiple consecutive spaces found between words.`,
        line: lineNumber
      });
      score -= 1;
    }

    // --- Original Checks ---

    if (l.startsWith('## ')) {
      if (l.includes('experience') || l.includes('work') || l.includes('employment')) hasExperience = true;
      if (l.includes('education') || l.includes('academic')) hasEducation = true;
      if (l.includes('skill') || l.includes('technologies')) hasSkills = true;
    }

    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      bulletsFound++;

      const content = trimmed.substring(2).trim();
      const contentLower = content.toLowerCase();

      // Metrics check (numbers, percentages, dollar signs)
      if (/\d+/.test(content) || /%/.test(content) || /\$/.test(content)) {
        bulletsWithMetrics++;
      }

      // Action verb check (first word)
      const firstWordMatch = contentLower.match(/^[a-z]+/);
      if (firstWordMatch) {
        const firstWord = firstWordMatch[0];
        if (STRONG_VERBS.includes(firstWord)) {
          bulletsWithStrongVerbs++;
        }
      }

      // Weak phrases check
      WEAK_PHRASES.forEach(phrase => {
        if (contentLower.includes(phrase)) {
          weakPhrasesFound++;
        }
      });
    }
  });

  if (!hasExperience) {
    feedback.push({ type: 'error', message: 'Missing an "Experience" or "Work History" section.' });
    score -= 15;
  } else {
    feedback.push({ type: 'success', message: 'Experience section found.' });
  }

  if (!hasEducation) {
    feedback.push({ type: 'error', message: 'Missing an "Education" section.' });
    score -= 10;
  }

  if (!hasSkills) {
    feedback.push({ type: 'warning', message: 'Consider adding a dedicated "Skills" section for quick scanning.' });
    score -= 5;
  }

  if (bulletsFound > 0) {
    const metricsRatio = bulletsWithMetrics / bulletsFound;
    if (metricsRatio < 0.3) {
      feedback.push({ type: 'warning', message: `Only ${Math.round(metricsRatio * 100)}% of your bullet points contain quantifiable metrics (numbers/percentages). Try to add more!` });
      score -= 10;
    } else {
      feedback.push({ type: 'success', message: 'Great use of quantifiable metrics in your experience.' });
    }

    if (weakPhrasesFound > 0) {
      feedback.push({ type: 'error', message: `Found ${weakPhrasesFound} passive phrases (like "responsible for"). Replace them with strong action verbs.` });
      score -= (weakPhrasesFound * 2);
    }

    const verbsRatio = bulletsWithStrongVerbs / bulletsFound;
    if (verbsRatio < 0.5 && weakPhrasesFound === 0) {
      feedback.push({ type: 'warning', message: 'Many bullet points do not start with a strong action verb (e.g., "Led", "Developed").' });
      score -= 5;
    }
  } else if (hasExperience) {
    feedback.push({ type: 'warning', message: 'No bullet points found. Use bullet points rather than paragraphs for better readability.' });
    score -= 10;
  }

  // 4. Cliché / Buzzword Check
  const clichesFound: string[] = [];
  CLICHES.forEach(cliche => {
    if (lowerMarkdown.includes(cliche)) {
      clichesFound.push(cliche);
    }
  });

  if (clichesFound.length > 0) {
    feedback.push({
      type: 'warning',
      message: `Avoid empty buzzwords: ${clichesFound.map(c => `"${c}"`).join(', ')}. Show these traits through your accomplishments instead.`
    });
    score -= (clichesFound.length * 2);
  }

  // Ensure score stays within 0-100
  score = Math.max(0, Math.min(100, score));

  return { score, feedback };
}
