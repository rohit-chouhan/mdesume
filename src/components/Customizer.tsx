import { useState } from "react";
import { ResumeStyles } from "@/lib/db";
import { Palette, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, LayoutList, LayoutTemplate } from "lucide-react";
import Select from 'react-select';
import TemplateSelectorModal from "./TemplateSelectorModal";

interface CustomizerProps {
  styles: ResumeStyles;
  onChange: (styles: ResumeStyles) => void;
}

const fontOptions = [
  // Standard / System Fonts
  { value: "'Arial', sans-serif", label: "Arial" },
  { value: "'Helvetica', sans-serif", label: "Helvetica" },
  { value: "'Calibri', sans-serif", label: "Calibri" },
  { value: "'Cambria', serif", label: "Cambria" },
  { value: "'Georgia', serif", label: "Georgia" },
  { value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", label: "Segoe UI" },
  { value: "'Aptos', sans-serif", label: "Aptos" },

  // Google Fonts
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'Outfit', sans-serif", label: "Outfit" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Lora', serif", label: "Lora" },
  { value: "'PT Serif', serif", label: "PT Serif" },
  { value: "'EB Garamond', serif", label: "EB Garamond" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "'Fira Code', monospace", label: "Fira Code" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk" },
];

const formatOptionLabel = ({ value, label }: { value: string; label: string }) => (
  <div style={{ fontFamily: value, fontSize: '15px' }}>
    {label}
  </div>
);

export default function Customizer({ styles, onChange }: CustomizerProps) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const handleChange = (key: keyof ResumeStyles, value: string | number | boolean) => {
    onChange({ ...styles, [key]: value });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="h-14 border-b border-slate-200 dark:border-slate-700 flex items-center px-6 font-semibold text-slate-800 dark:text-slate-100">
        Customization
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* Typography Section */}
        <section>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4 uppercase tracking-wider">
            <Type size={16} className="text-primary" /> Typography
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Font Family</label>
              <Select
                value={fontOptions.find(opt => opt.value === styles.fontFamily) || { value: styles.fontFamily, label: 'Custom Font' }}
                onChange={(option) => option && handleChange('fontFamily', option.value)}
                options={fontOptions}
                formatOptionLabel={formatOptionLabel}
                className="text-sm"
                classNamePrefix="select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: 'transparent',
                    borderColor: state.isFocused ? '#6366f1' : '#cbd5e1',
                    '&:hover': { borderColor: '#94a3b8' },
                    boxShadow: 'none',
                    minHeight: '38px',
                    borderRadius: '0.375rem',
                  }),
                  menu: (base) => ({ ...base, zIndex: 50 }),
                }}
              />
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Text Alignment</label>
              <div className="flex gap-2">
                {[
                  { value: 'left', icon: <AlignLeft size={16} /> },
                  { value: 'center', icon: <AlignCenter size={16} /> },
                  { value: 'right', icon: <AlignRight size={16} /> },
                  { value: 'justify', icon: <AlignJustify size={16} /> },
                ].map((align) => (
                  <button
                    key={align.value}
                    onClick={() => handleChange('textAlign', align.value)}
                    className={`flex-1 py-1.5 flex justify-center items-center rounded border transition-colors ${(styles.textAlign || 'left') === align.value
                      ? 'border-primary bg-blue-50 text-primary dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    title={`Align ${align.value}`}
                  >
                    {align.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Colors Section */}
        <section>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
            <Palette size={16} className="text-primary" /> Colors & Sizes
          </h3>
          <div className="space-y-4">

            {/* H1 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Heading 1 (H1)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.h1Color}
                    onChange={(e) => handleChange('h1Color', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="number"
                    value={styles.h1Size || 24}
                    onChange={(e) => handleChange('h1Size', e.target.value)}
                    className="w-16 text-xs rounded border border-slate-300 px-2 py-1 bg-slate-50 focus:ring-1 focus:ring-primary outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="Size"
                    min="10" max="72"
                  />
                  <span className="text-[10px] text-slate-400">pt</span>
                </div>
              </div>
            </div>

            {/* H2 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Heading 2 (H2)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.h2Color}
                    onChange={(e) => handleChange('h2Color', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="number"
                    value={styles.h2Size || 18}
                    onChange={(e) => handleChange('h2Size', e.target.value)}
                    className="w-16 text-xs rounded border border-slate-300 px-2 py-1 bg-slate-50 focus:ring-1 focus:ring-primary outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="Size"
                    min="10" max="72"
                  />
                  <span className="text-[10px] text-slate-400">pt</span>
                </div>
              </div>
            </div>

            {/* H3 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Heading 3 (H3)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.h3Color || '#4b5563'}
                    onChange={(e) => handleChange('h3Color', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="number"
                    value={styles.h3Size || 14}
                    onChange={(e) => handleChange('h3Size', e.target.value)}
                    className="w-16 text-xs rounded border border-slate-300 px-2 py-1 bg-slate-50 focus:ring-1 focus:ring-primary outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="Size"
                    min="8" max="72"
                  />
                  <span className="text-[10px] text-slate-400">pt</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Body Text</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.textColor}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="number"
                    value={styles.textSize || 12}
                    onChange={(e) => handleChange('textSize', e.target.value)}
                    className="w-16 text-xs rounded border border-slate-300 px-2 py-1 bg-slate-50 focus:ring-1 focus:ring-primary outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="Size"
                    min="8" max="72"
                  />
                  <span className="text-[10px] text-slate-400">pt</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 my-2" />

            {/* Links & Icons */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Link Color</label>
                <input
                  type="color"
                  value={styles.linkColor || '#2563eb'}
                  onChange={(e) => handleChange('linkColor', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Icon Color</label>
                <input
                  type="color"
                  value={styles.iconColor || '#64748b'}
                  onChange={(e) => handleChange('iconColor', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="block text-xs font-medium text-slate-500">Hide Link Underlines</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={styles.hideLinkUnderline !== false} // default to true
                  onChange={(e) => handleChange('hideLinkUnderline', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

          </div>
        </section>

        {/* Spacing Section */}
        <section>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
            <AlignLeft size={16} className="text-primary" /> Spacing
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Page Padding</label>
              <select
                value={styles.padding}
                onChange={(e) => handleChange('padding', e.target.value)}
                className="w-full text-sm rounded-md border border-slate-300 px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:color-scheme-dark"
              >
                <option value="1rem">Compact (1rem)</option>
                <option value="2rem">Normal (2rem)</option>
                <option value="3rem">Spacious (3rem)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Element Margin</label>
              <select
                value={styles.margin}
                onChange={(e) => handleChange('margin', e.target.value)}
                className="w-full text-sm rounded-md border border-slate-300 px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:color-scheme-dark"
              >
                <option value="0.5rem">Tight (0.5rem)</option>
                <option value="1rem">Normal (1rem)</option>
                <option value="1.5rem">Loose (1.5rem)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Line Height</label>
              <select
                value={styles.lineHeight}
                onChange={(e) => handleChange('lineHeight', e.target.value)}
                className="w-full text-sm rounded-md border border-slate-300 px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:color-scheme-dark"
              >
                <option value="1.2">Compact (1.2)</option>
                <option value="1.6">Normal (1.6)</option>
                <option value="2.0">Loose (2.0)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Section Spacing</label>
              <select
                value={styles.sectionSpacing || '1.5rem'}
                onChange={(e) => handleChange('sectionSpacing', e.target.value)}
                className="w-full text-sm rounded-md border border-slate-300 px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:color-scheme-dark"
              >
                <option value="0.75rem">Tight (0.75rem)</option>
                <option value="1.5rem">Normal (1.5rem)</option>
                <option value="2.5rem">Loose (2.5rem)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">List Item Spacing</label>
              <select
                value={styles.listSpacing || '0.25rem'}
                onChange={(e) => handleChange('listSpacing', e.target.value)}
                className="w-full text-sm rounded-md border border-slate-300 px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:color-scheme-dark"
              >
                <option value="0">None (0)</option>
                <option value="0.25rem">Compact (0.25rem)</option>
                <option value="0.5rem">Normal (0.5rem)</option>
                <option value="1rem">Loose (1rem)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Layout Section */}
        <section>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
            <LayoutList size={16} className="text-primary" /> Layout
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Design Template</label>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="w-full flex items-center justify-between text-sm rounded-md border border-slate-300 px-3 py-2 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <span className="font-medium text-slate-700 dark:text-white capitalize">{styles.template || 'classic'}</span>
                <LayoutTemplate size={16} className="text-slate-400" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Page Size</label>
              <select
                value={styles.pageSize || 'A4'}
                onChange={(e) => handleChange('pageSize', e.target.value)}
                className="w-full text-sm rounded-md border border-slate-300 px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:color-scheme-dark"
              >
                <option value="A4">A4 (210 x 297 mm)</option>
                <option value="Letter">US Letter (8.5 x 11 in)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">PDF Export Format</label>
              <select
                value={styles.exportFormat || 'single'}
                onChange={(e) => handleChange('exportFormat', e.target.value)}
                className="w-full text-sm rounded-md border border-slate-300 px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:color-scheme-dark"
              >
                <option value="single">Single Long Page (Auto Height)</option>
                <option value="split">Auto-Split (Standard Pages)</option>
              </select>
            </div>

            {/* Show Link Icons Toggle */}
            <div className="flex items-center justify-between pt-2">
              <label className="block text-xs font-medium text-slate-500">Auto-inject Link Icons</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={styles.showLinkIcons !== false} // default to true
                  onChange={(e) => handleChange('showLinkIcons', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">List Columns</label>
              <div className="flex gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleChange('listColumns', num)}
                    className={`flex-1 py-1.5 text-sm rounded font-medium border transition-colors ${styles.listColumns === num
                      ? 'border-primary bg-blue-50 text-primary dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                  >
                    {num} {num === 1 ? 'Col' : 'Cols'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Applies column layout to all lists.</p>
            </div>
          </div>
        </section>

      </div>

      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentTemplate={styles.template || 'classic'}
        onSelect={(templateId) => handleChange('template', templateId)}
      />
    </div>
  );
}
