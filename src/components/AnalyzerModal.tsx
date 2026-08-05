import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { analyzeResume, AnalyzerResult } from '@/lib/analyzer';

interface AnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
}

export default function AnalyzerModal({ isOpen, onClose, markdown }: AnalyzerModalProps) {
  const [result, setResult] = useState<AnalyzerResult | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Run analysis when opened. This is an intentional effect-driven update
      // (analysis is triggered by the open transition, not derived state).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(analyzeResume(markdown));
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, markdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Resume Analysis</h2>
              <p className="text-sm text-slate-500 mt-0.5">Automated heuristic review for maximum impact.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {result ? (
            <div className="space-y-8">

              {/* Score Section */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeDasharray="100, 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3"
                      stroke="currentColor"
                    />
                    <path
                      className={
                        result.score >= 80 ? "text-green-500" :
                          result.score >= 60 ? "text-amber-500" : "text-red-500"
                      }
                      strokeDasharray={`${result.score}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3"
                      stroke="currentColor"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-slate-800">{result.score}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium text-slate-600">
                  {result.score >= 90 ? "Excellent! Your resume is highly optimized." :
                    result.score >= 70 ? "Good start, but there's room for improvement." :
                      "Needs significant improvements to stand out."}
                </p>
              </div>

              {/* Feedback List */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Detailed Feedback</h3>
                <div className="space-y-3">
                  {result.feedback.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${item.type === 'error' ? 'bg-red-50 border-red-100 text-red-900' :
                          item.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                            'bg-green-50 border-green-100 text-green-900'
                        }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {item.type === 'error' ? <XCircle size={18} className="text-red-500" /> :
                          item.type === 'warning' ? <AlertTriangle size={18} className="text-amber-500" /> :
                            <CheckCircle2 size={18} className="text-green-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-snug">{item.message}</p>
                        {item.line !== undefined && (
                          <p className={`text-xs mt-1 font-medium ${item.type === 'error' ? 'text-red-700/70' :
                              item.type === 'warning' ? 'text-amber-700/70' :
                                'text-green-700/70'
                            }`}>
                            Line {item.line}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
