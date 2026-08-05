import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Columns3, AlignCenter, ArrowDownToLine, ExternalLink, FileText, X, Check } from "lucide-react";
import GuidePreview from "@/components/GuidePreview";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
    title: "Guide · mdesume",
    description:
        "Learn the mdesume Markdown symbols — columns, alignment, spacing, and standard Markdown — with before/after examples.",
    openGraph: {
        title: "mdesume Guide — Markdown symbols explained",
        description:
            "Learn the mdesume Markdown symbols — columns, alignment, spacing, and standard Markdown — with before/after examples.",
    },
};

function Section({
    icon,
    title,
    symbol,
    description,
    withoutNode,
    withNode,
    withoutCode,
    withCode,
}: {
    icon: React.ReactNode;
    title: string;
    symbol: string;
    description: React.ReactNode;
    withoutNode: React.ReactNode;
    withNode: React.ReactNode;
    withoutCode: string;
    withCode: string;
}) {
    return (
        <section className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-3">
                <div className="mt-0.5 text-indigo-600 dark:text-indigo-400">{icon}</div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                    <code className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-900 dark:bg-slate-950 text-indigo-200 text-xs font-mono">
                        {symbol}
                    </code>
                </div>
            </div>
            <div className="px-5 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {description}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 sm:px-6 pb-6">
                <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-600 dark:bg-red-500/20">
                            <X size={11} strokeWidth={3} />
                        </span>
                        Without
                    </p>
                    <GuidePreview>{withoutNode}</GuidePreview>
                    <pre className="mt-3 text-[11px] leading-relaxed bg-slate-900 text-slate-200 rounded-md p-3 overflow-auto">
                        {withoutCode}
                    </pre>
                </div>
                <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-600 dark:bg-green-500/20">
                            <Check size={11} strokeWidth={3} />
                        </span>
                        With
                    </p>
                    <GuidePreview>{withNode}</GuidePreview>
                    <pre className="mt-3 text-[11px] leading-relaxed bg-slate-900 text-slate-200 rounded-md p-3 overflow-auto">
                        {withCode}
                    </pre>
                </div>
            </div>
        </section>
    );
}

const GithubIcon = ({ size = 18, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                    >
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-1.5 rounded-lg">
                            <FileText size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">mdesume</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/guide"
                            className="hidden sm:flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                            <BookOpen size={18} /> Guide
                        </Link>
                        <a
                            href="https://github.com/rohit-chouhan/mdesume"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="mdesume on GitHub"
                            className="hidden sm:flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                            <GithubIcon size={18} /> GitHub
                        </a>
                        <Link
                            href="/dashboard"
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-medium transition-all shadow-sm hover:shadow dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                        >
                            Go to Dashboard
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <header className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-300 text-sm font-semibold mb-4">
                        <BookOpen size={16} /> Guide
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                        Writing your resume in Markdown
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                        mdesume extends standard Markdown with a few special{" "}
                        <strong>symbols</strong> (directives written on their own line) for
                        controlling layout — multi-column lists, text alignment, and custom
                        spacing. Each example below shows the same content{" "}
                        <em>without</em> and <em>with</em> the symbol. New to Markdown?{" "}
                        <a
                            href="https://www.markdownguide.org/getting-started/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                        >
                            Getting Started <ExternalLink size={13} />
                        </a>{" "}
                        is a great place to learn.
                    </p>
                </header>

                <div className="space-y-8">
                    <section className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Standard Markdown you can use
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                Everything below works exactly as you&apos;d expect — no special
                                symbols required. See the full syntax at{" "}
                                <a
                                    href="https://www.markdownguide.org/basic-syntax/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                                >
                                    Markdown Guide: Basic Syntax <ExternalLink size={13} />
                                </a>
                                .
                            </p>
                        </div>
                        <div className="overflow-x-auto px-5 sm:px-6 py-5">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="text-left border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                        <th className="py-2 pr-4 font-medium">Element</th>
                                        <th className="py-2 pr-4 font-medium">Syntax</th>
                                        <th className="py-2 font-medium">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="align-top">
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-100">Heading</td>
                                        <td className="py-2 pr-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                                            # H1 · ## H2 · ### H3
                                        </td>
                                        <td className="py-2 text-slate-600 dark:text-slate-300">
                                            H1 = name, H2 = section, H3 = role/subtitle.{" "}
                                            <a
                                                href="https://www.markdownguide.org/basic-syntax/#headings"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                                            >
                                                Docs <ExternalLink size={12} />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-100">Bold / Italic</td>
                                        <td className="py-2 pr-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                                            **bold** · _italic_
                                        </td>
                                        <td className="py-2 text-slate-600 dark:text-slate-300">
                                            Use italic for titles/roles.{" "}
                                            <a
                                                href="https://www.markdownguide.org/basic-syntax/#emphasis"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                                            >
                                                Docs <ExternalLink size={12} />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-100">Link</td>
                                        <td className="py-2 pr-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                                            [label](url)
                                        </td>
                                        <td className="py-2 text-slate-600 dark:text-slate-300">
                                            GitHub / LinkedIn / LeetCode get icons automatically.{" "}
                                            <a
                                                href="https://www.markdownguide.org/basic-syntax/#links"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                                            >
                                                Docs <ExternalLink size={12} />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-100">Bullet list</td>
                                        <td className="py-2 pr-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                                            - item
                                        </td>
                                        <td className="py-2 text-slate-600 dark:text-slate-300">
                                            Set global columns in the Customizer.{" "}
                                            <a
                                                href="https://www.markdownguide.org/basic-syntax/#lists-1"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                                            >
                                                Docs <ExternalLink size={12} />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-100">Table</td>
                                        <td className="py-2 pr-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                                            | a | b |<br />
                                            |---|---|
                                        </td>
                                        <td className="py-2 text-slate-600 dark:text-slate-300">
                                            GitHub-Flavored Markdown tables.{" "}
                                            <a
                                                href="https://www.markdownguide.org/extended-syntax/#tables"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                                            >
                                                Docs <ExternalLink size={12} />
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                        mdesume Advanced Symbols
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        mdesume provides several advanced symbols and syntax extensions to enhance your resume writing experience.
                    </p>
                    <Section
                        icon={<Columns3 size={20} />}
                        title="Columns"
                        symbol="::col-2::  …  ::end-col::"
                        description={
                            <>
                                Wrap content in <code className="font-mono">::col-N::</code> and{" "}
                                <code className="font-mono">::end-col::</code> to lay it out in
                                N columns (2, 3, or 4). Perfect for skills, languages, or
                                compact project grids. A heading of depth 1–2 automatically ends
                                the column block.
                            </>
                        }
                        withoutCode={`## Skills

- **Languages**: JavaScript, TypeScript, Python
- **Backend**: Node.js, Express, REST APIs
- **Frontend**: React, Next.js, Angular
- **Cloud**: GitHub Actions, Docker, GCP`}
                        withCode={`## Skills

::col-2::
- **Languages**: JavaScript, TypeScript, Python
- **Backend**: Node.js, Express, REST APIs
- **Frontend**: React, Next.js, Angular
- **Cloud**: GitHub Actions, Docker, GCP
::end-col::`}
                        withoutNode={
                            <div>
                                <h2 className="text-base font-semibold border-b border-slate-300 pb-1 mb-2">
                                    Skills
                                </h2>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li><strong>Languages</strong>: JavaScript, TypeScript, Python</li>
                                    <li><strong>Backend</strong>: Node.js, Express, REST APIs</li>
                                    <li><strong>Frontend</strong>: React, Next.js, Angular</li>
                                    <li><strong>Cloud</strong>: GitHub Actions, Docker, GCP</li>
                                </ul>
                            </div>
                        }
                        withNode={
                            <div>
                                <h2 className="text-base font-semibold border-b border-slate-300 pb-1 mb-2">
                                    Skills
                                </h2>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                    <div><strong>Languages</strong>: JavaScript, TypeScript, Python</div>
                                    <div><strong>Backend</strong>: Node.js, Express, REST APIs</div>
                                    <div><strong>Frontend</strong>: React, Next.js, Angular</div>
                                    <div><strong>Cloud</strong>: GitHub Actions, Docker, GCP</div>
                                </div>
                            </div>
                        }
                    />

                    <Section
                        icon={<AlignCenter size={20} />}
                        title="Text Alignment"
                        symbol="::align-center::  …  ::end-align::"
                        description={
                            <>
                                Align a block of content with{" "}
                                <code className="font-mono">::align-left::</code>,{" "}
                                <code className="font-mono">::align-center::</code>,{" "}
                                <code className="font-mono">::align-right::</code>, or{" "}
                                <code className="font-mono">::align-justify::</code>, closed by{" "}
                                <code className="font-mono">::end-align::</code>. Great for
                                centering a name and contact line in the header.
                            </>
                        }
                        withoutCode={`# Jane Doe
Software Engineer

[jane@email.com](mailto:jane@email.com) · linkedin.com/in/jane`}
                        withCode={`::align-center::
# Jane Doe
Software Engineer

[jane@email.com](mailto:jane@email.com) · linkedin.com/in/jane
::end-align::`}
                        withoutNode={
                            <div className="text-left">
                                <h1 className="text-xl font-bold">Jane Doe</h1>
                                <p className="text-sm text-slate-600">Software Engineer</p>
                                <p className="text-xs text-slate-500 mt-1">jane@email.com · linkedin.com/in/jane</p>
                            </div>
                        }
                        withNode={
                            <div className="text-center">
                                <h1 className="text-xl font-bold">Jane Doe</h1>
                                <p className="text-sm text-slate-600">Software Engineer</p>
                                <p className="text-xs text-slate-500 mt-1">jane@email.com · linkedin.com/in/jane</p>
                            </div>
                        }
                    />

                    <Section
                        icon={<ArrowDownToLine size={20} />}
                        title="Vertical Spacing"
                        symbol="::height-24::"
                        description={
                            <>
                                Insert a blank vertical spacer of N pixels with{" "}
                                <code className="font-mono">::height-N::</code> (no closing
                                tag). Use it to fine-tune gaps between sections when automatic
                                spacing isn&apos;t quite right.
                            </>
                        }
                        withoutCode={`## Experience

**Senior Developer** | Acme Corp

## Education

BCA, University of Example`}
                        withCode={`## Experience

**Senior Developer** | Acme Corp

::height-32::

## Education

BCA, University of Example`}
                        withoutNode={
                            <div className="text-sm space-y-1">
                                <h2 className="text-base font-semibold border-b border-slate-300 pb-1">Experience</h2>
                                <p><strong>Senior Developer</strong> | Acme Corp</p>
                                <h2 className="text-base font-semibold border-b border-slate-300 pb-1">Education</h2>
                                <p>BCA, University of Example</p>
                            </div>
                        }
                        withNode={
                            <div className="text-sm space-y-1">
                                <h2 className="text-base font-semibold border-b border-slate-300 pb-1">Experience</h2>
                                <p><strong>Senior Developer</strong> | Acme Corp</p>
                                <div style={{ height: "28px" }} />
                                <h2 className="text-base font-semibold border-b border-slate-300 pb-1">Education</h2>
                                <p>BCA, University of Example</p>
                            </div>
                        }
                    />

                    <Section
                        icon={<Columns3 size={20} />}
                        title="Skill Badges"
                        symbol="::badges::  …  ::end-badges::"
                        description={
                            <>
                                Wrap a comma- or line-separated list in{" "}
                                <code className="font-mono">::badges::</code> and{" "}
                                <code className="font-mono">::end-badges::</code> to render
                                each item as a rounded pill — cleaner than a plain bullet list
                                for skills.
                            </>
                        }
                        withoutCode={`**Skills:** JavaScript, TypeScript, React, Node.js`}
                        withCode={`::badges::
JavaScript, TypeScript, React, Node.js
::end-badges::`}
                        withoutNode={
                            <div className="text-sm">
                                <strong>Skills:</strong> JavaScript, TypeScript, React, Node.js
                            </div>
                        }
                        withNode={
                            <div className="text-sm">
                                <div className="resume-badges">
                                    <span className="resume-badge">JavaScript</span>
                                    <span className="resume-badge">TypeScript</span>
                                    <span className="resume-badge">React</span>
                                    <span className="resume-badge">Node.js</span>
                                </div>
                            </div>
                        }
                    />

                    <Section
                        icon={<AlignCenter size={20} />}
                        title="Proficiency Rating"
                        symbol="::rating-N::"
                        description={
                            <>
                                Add a 5-bar proficiency indicator with{" "}
                                <code className="font-mono">::rating-N::</code> (N is 0–5).
                                Great for languages or soft skills.
                            </>
                        }
                        withoutCode={`Leadership: 4 / 5`}
                        withCode={`Leadership ::rating-4::`}
                        withoutNode={
                            <div className="text-sm">Leadership: 4 / 5</div>
                        }
                        withNode={
                            <div className="text-sm">
                                Leadership
                                <span className="resume-rating" aria-label="Rating 4 out of 5">
                                    <span className="resume-rating-bar filled" />
                                    <span className="resume-rating-bar filled" />
                                    <span className="resume-rating-bar filled" />
                                    <span className="resume-rating-bar filled" />
                                    <span className="resume-rating-bar" />
                                </span>
                            </div>
                        }
                    />

                    <Section
                        icon={<ArrowDownToLine size={20} />}
                        title="Flex Row"
                        symbol="::row::  …  ::end-row::"
                        description={
                            <>
                                Lay children out on a single spaced row with{" "}
                                <code className="font-mono">::row::</code> /{" "}
                                <code className="font-mono">::end-row::</code> — perfect for a
                                title on the left and a date on the right.
                            </>
                        }
                        withoutCode={`**Senior Developer** | Acme Corp
_2020 – 2024_`}
                        withCode={`::row::
**Senior Developer** | Acme Corp  _2020 – 2024_
::end-row::`}
                        withoutNode={
                            <div className="text-sm">
                                <p className="font-semibold">Senior Developer | Acme Corp</p>
                                <p className="text-slate-500 italic">2020 – 2024</p>
                            </div>
                        }
                        withNode={
                            <div className="text-sm resume-row">
                                <span className="font-semibold">Senior Developer | Acme Corp</span>
                                <span className="text-slate-500 italic">2020 – 2024</span>
                            </div>
                        }
                    />

                    <Section
                        icon={<BookOpen size={20} />}
                        title="Callout Note"
                        symbol="::note::  …  ::end-note::"
                        description={
                            <>
                                Wrap text in <code className="font-mono">::note::</code> /{" "}
                                <code className="font-mono">::end-note::</code> to render a
                                highlighted callout box — useful for a summary highlight.
                            </>
                        }
                        withoutCode={`Recognized as top 3% problem solver.`}
                        withCode={`::note::
Recognized as top 3% problem solver.
::end-note::`}
                        withoutNode={
                            <div className="text-sm">Recognized as top 3% problem solver.</div>
                        }
                        withNode={
                            <div className="text-sm resume-note">
                                Recognized as top 3% problem solver.
                            </div>
                        }
                    />

                    <Section
                        icon={<Columns3 size={20} />}
                        title="Compact Spacing"
                        symbol="::compact::  …  ::end-compact::"
                        description={
                            <>
                                Wrap a block in <code className="font-mono">::compact::</code> /{" "}
                                <code className="font-mono">::end-compact::</code> to tighten
                                the vertical spacing of its children for dense sections.
                            </>
                        }
                        withoutCode={`- Shipped 3 features
- Improved perf 40%
- Led 2 releases`}
                        withCode={`::compact::
- Shipped 3 features
- Improved perf 40%
- Led 2 releases
::end-compact::`}
                        withoutNode={
                            <ul className="list-disc pl-5 text-sm space-y-2">
                                <li>Shipped 3 features</li>
                                <li>Improved perf 40%</li>
                                <li>Led 2 releases</li>
                            </ul>
                        }
                        withNode={
                            <ul className="list-disc pl-5 text-sm resume-compact">
                                <li>Shipped 3 features</li>
                                <li>Improved perf 40%</li>
                                <li>Led 2 releases</li>
                            </ul>
                        }
                    />

                    <Section
                        icon={<ArrowDownToLine size={20} />}
                        title="Profile Photo"
                        symbol="::avatar[url]::"
                        description={
                            <>
                                Drop a circular profile photo into the header with{" "}
                                <code className="font-mono">::avatar[url]::</code> (no closing
                                tag). Use an absolute image URL.
                            </>
                        }
                        withoutCode={`# Jane Doe
Software Engineer`}
                        withCode={`::avatar[https://i.pravatar.cc/160]::

# Jane Doe
Software Engineer`}
                        withoutNode={
                            <div className="text-left">
                                <h1 className="text-xl font-bold">Jane Doe</h1>
                                <p className="text-sm text-slate-600">Software Engineer</p>
                            </div>
                        }
                        withNode={
                            <div className="text-left text-sm">
                                <img
                                    src="https://i.pravatar.cc/160"
                                    alt="Profile photo"
                                    className="resume-avatar"
                                />
                                <h1 className="text-xl font-bold">Jane Doe</h1>
                                <p className="text-slate-600">Software Engineer</p>
                            </div>
                        }
                    />

                    <Section
                        icon={<BookOpen size={20} />}
                        title="QR Code Box"
                        symbol="::qr[url]::"
                        description={
                            <>
                                Add a QR placeholder box linking to a URL with{" "}
                                <code className="font-mono">::qr[url]::</code> (no closing tag).
                                Shown as a dashed box with the link — handy for a portfolio QR.
                            </>
                        }
                        withoutCode={`[Portfolio](https://example.com)`}
                        withCode={`::qr[https://example.com]::
[Portfolio](https://example.com)`}
                        withoutNode={
                            <div className="text-sm">
                                <a href="https://example.com" className="text-indigo-600 underline">Portfolio</a>
                            </div>
                        }
                        withNode={
                            <div className="text-sm flex items-center gap-3">
                                <div className="resume-qr">https://example.com</div>
                                <a href="https://example.com" className="text-indigo-600 underline">Portfolio</a>
                            </div>
                        }
                    />
                </div>

                <div className="mt-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">Ready to write yours?</h2>
                    <p className="text-indigo-100 mb-6">
                        Open the builder, paste the examples above, and export to PDF.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-full font-bold transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                        Go to Dashboard <ArrowLeft size={18} className="rotate-180" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
