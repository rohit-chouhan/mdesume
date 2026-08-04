import Link from 'next/link';
import { ArrowRight, Zap, Shield, Layout, Code2, FileText, CheckCircle2, BookOpen } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-1.5 rounded-lg">
              <FileText size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">mdesume</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/guide"
              aria-label="mdesume writing guide"
              className="hidden sm:flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <BookOpen size={18} /> Guide
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="mdesume on GitHub"
              className="hidden sm:flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Code2 size={18} /> GitHub
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

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8 shadow-sm">
            <Zap size={16} className="text-amber-500 fill-amber-500" />
            <span>The fastest way to build a resume</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
            Craft the perfect resume <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              in seconds.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            A lightning-fast, local-first resume builder powered by Markdown.
            Choose from premium aesthetic templates and export to PDF instantly.
            No sign-ups, no data tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-950/40 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Build Your Resume Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-sm w-full sm:w-auto dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 dark:border-slate-700"
            >
              <Code2 size={20} />
              View Source
            </a>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 flex items-center justify-center gap-1.5">
            <CheckCircle2 size={16} className="text-green-500" /> 100% Free & Open Source
          </p>
        </div>

        {/* Abstract Visual Showcase */}
        <div className="mt-20 max-w-6xl mx-auto relative z-10">
          <div className="relative rounded-2xl bg-white/50 backdrop-blur-xl border border-slate-200/50 shadow-2xl p-2 md:p-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-white/50 to-violet-50/50" />
            <div className="relative rounded-xl border border-slate-200 bg-slate-900 shadow-inner flex overflow-hidden aspect-video">

              {/* Fake Editor Panel */}
              <div className="w-1/3 bg-[#1e1e1e] border-r border-slate-800 flex flex-col hidden sm:flex">
                <div className="h-8 bg-[#252526] flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="p-4 font-mono text-xs text-emerald-400 opacity-80 space-y-2">
                  <p><span className="text-blue-400">#</span> John Doe</p>
                  <p>Software Engineer</p>
                  <br />
                  <p><span className="text-blue-400">##</span> Experience</p>
                  <p><span className="text-yellow-300">**</span>Senior Developer<span className="text-yellow-300">**</span> | Acme Corp</p>
                  <p>- Built scalable web applications</p>
                  <p>- Improved performance by 40%</p>
                </div>
              </div>

              {/* Fake Preview Panel */}
              <div className="flex-1 bg-slate-200 flex items-center justify-center p-8">
                <div className="w-full max-w-sm aspect-[1/1.4] bg-white shadow-2xl rounded-sm p-6 relative">
                  <div className="w-1/2 h-6 bg-slate-800 rounded mb-2" />
                  <div className="w-1/3 h-3 bg-slate-400 rounded mb-8" />

                  <div className="w-full h-px bg-slate-200 mb-4" />

                  <div className="flex justify-between items-start mb-2">
                    <div className="w-2/5 h-4 bg-slate-700 rounded" />
                    <div className="w-1/4 h-3 bg-slate-300 rounded" />
                  </div>
                  <div className="space-y-2 pl-4">
                    <div className="w-full h-2 bg-slate-200 rounded" />
                    <div className="w-11/12 h-2 bg-slate-200 rounded" />
                    <div className="w-4/5 h-2 bg-slate-200 rounded" />
                  </div>

                  <div className="w-full h-px bg-slate-200 my-4" />

                  <div className="flex justify-between items-start mb-2">
                    <div className="w-1/3 h-4 bg-slate-700 rounded" />
                    <div className="w-1/4 h-3 bg-slate-300 rounded" />
                  </div>
                  <div className="space-y-2 pl-4">
                    <div className="w-10/12 h-2 bg-slate-200 rounded" />
                    <div className="w-full h-2 bg-slate-200 rounded" />
                  </div>

                  {/* Floating abstract UI elements */}
                  <div className="absolute -right-12 top-10 bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex flex-col gap-2 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
                    <div className="w-6 h-6 rounded-full bg-slate-100" />
                    <div className="w-6 h-6 rounded-full bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900 relative z-10 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Everything you need, nothing you don&apos;t.</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Built for developers and designers who value speed and privacy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:hover:border-indigo-500/40">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 dark:bg-indigo-500/20">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Lightning Fast</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Experience instant live-previews as you type. Your markdown is parsed and rendered in milliseconds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-violet-100 hover:shadow-lg hover:shadow-violet-50 transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:hover:border-violet-500/40">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-6 dark:bg-violet-500/20">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">100% Private</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Local-first architecture using IndexedDB. Your resume data never leaves your browser unless you export it.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:hover:border-blue-500/40">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 dark:bg-blue-500/20">
                <Layout size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Premium Templates</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Choose from 7+ beautifully crafted aesthetic templates. Swap designs instantly without touching your content.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-50 transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:hover:border-emerald-500/40">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 dark:bg-emerald-500/20">
                <Code2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Open Source</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Fully transparent and community-driven. Fork it, customize it, and deploy your own version for free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 dark:bg-slate-950 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-slate-400 dark:text-slate-500" />
            <span className="font-bold text-slate-700 dark:text-slate-200 tracking-tight">mdesume</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Built with Next.js, Tailwind CSS, and Markdown.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="mdesume on GitHub"
              className="text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white transition-colors"
            >
              <Code2 size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
