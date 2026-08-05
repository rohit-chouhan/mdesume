import React, { useEffect, useState, useMemo } from 'react';
import Preview from './Preview';
import { X, CheckCircle2, Filter } from 'lucide-react';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: string;
  onSelect: (templateId: string) => void;
}

const templates = [
  { id: 'classic', name: 'Classic', tags: ['Simple', 'Professional', 'Clean'] },
  { id: 'modern', name: 'Modern', tags: ['Creative', 'Bold', 'Clean'] },
  { id: 'minimalist', name: 'Minimalist', tags: ['Minimal', 'Simple', 'Clean'] },
  { id: 'elegant', name: 'Elegant', tags: ['Elegant', 'Traditional', 'Professional'] },
  { id: 'creative', name: 'Creative', tags: ['Creative', 'Bold', 'Modern'] },
  { id: 'brutal', name: 'Neo-Brutal', tags: ['Bold', 'Quirky', 'Creative'] },
  { id: 'aesthetic', name: 'Aesthetic', tags: ['Minimal', 'Elegant', 'Modern'] },
  { id: 'professional', name: 'Professional', tags: ['Professional', 'Corporate', 'Clean'] },
  { id: 'bold', name: 'Bold Impact', tags: ['Bold', 'Modern', 'Corporate'] },
  { id: 'academic', name: 'Academic', tags: ['Traditional', 'Professional', 'Minimal'] },
];

const sampleMarkdown = `
# John Doe
Software Engineer | john@example.com

## Experience
**Senior Developer** | Acme Corp | 2020 - Present
- Built scalable web applications
- Led a team of 5 engineers
- Improved performance by 40%

## Education
**B.S. Computer Science** | University of Tech | 2016 - 2020
`;

export default function TemplateSelectorModal({ isOpen, onClose, currentTemplate, onSelect }: TemplateSelectorModalProps) {
  const [activeTag, setActiveTag] = useState<string>('All');
  const [renderPreviews, setRenderPreviews] = useState(false);

  // Extract unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    templates.forEach(t => t.tags.forEach(tag => tags.add(tag)));
    return ['All', ...Array.from(tags).sort()];
  }, []);

  const filteredTemplates = useMemo(() => {
    if (activeTag === 'All') return templates;
    return templates.filter(t => t.tags.includes(activeTag));
  }, [activeTag]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Defer rendering previews to keep the modal opening animation smooth
      const timer = setTimeout(() => setRenderPreviews(true), 150);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    } else {
      // Reset preview rendering when the modal closes. Intentional effect-driven
      // reset tied to the open/close transition, not derived state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRenderPreviews(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Select a Template</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose a visual style for your resume.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:text-slate-500 dark:hover:text-white dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Filter size={14} className="text-slate-400 mr-2 shrink-0" />
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors shrink-0 ${activeTag === tag
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((t) => {
              const isSelected = currentTemplate === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelect(t.id);
                    onClose();
                  }}
                  className={`group relative flex flex-col bg-white dark:bg-slate-800 rounded-lg border-2 transition-all cursor-pointer ${isSelected
                    ? 'border-primary shadow-md ring-4 ring-primary/10'
                    : 'border-transparent shadow hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:hover:border-slate-600'
                    }`}
                >
                  {/* Selection Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-10 text-primary bg-white rounded-full shadow-sm">
                      <CheckCircle2 size={24} className="fill-white" />
                    </div>
                  )}

                  {/* Thumbnail Container */}
                  <div className="relative w-full aspect-[1/1.2] overflow-hidden rounded-t-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center p-2">
                    <div className="relative w-[300px] h-[360px] overflow-hidden bg-white shadow-sm ring-1 ring-slate-900/5 origin-top left-1/2 -translate-x-1/2">
                      <div className="w-[800px] origin-top-left transform scale-[0.375] pointer-events-none">
                        <div className="bg-white" style={{ minHeight: '1123px' }}>
                          {renderPreviews ? (
                            <Preview
                              markdown={sampleMarkdown}
                              template={t.id}
                              listColumns={1}
                              showLinkIcons={false}
                              hideLinkUnderline={true}
                            />
                          ) : (
                            <div className="w-full h-full min-h-[1123px] flex items-center justify-center bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-400 text-4xl">
                              Loading preview...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors" />
                  </div>

                  {/* Footer Label */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-white">{t.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400 rounded">
                        {t.id}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {t.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
