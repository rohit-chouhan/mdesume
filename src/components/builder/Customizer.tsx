import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Check,
  ChevronDown,
  FileJson,
  FileText,
  LayoutTemplate,
  Link2,
  Palette,
  Printer,
  RotateCcw,
  Shuffle,
  Type,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { DEFAULT_STYLES, type ExportLayout, type ResumeMetadata, type ResumeStyles } from "@/lib/db";
import { getTheme, THEMES } from "@/lib/themes";
import {
  COLOR_PATTERNS,
  generateRandomColorPattern,
  getThemeColorPattern,
  isPatternActive,
  type ColorPattern,
} from "@/lib/colorPatterns";

const FONT_OPTIONS = [
  // Sans-serif
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta Sans" },
  { value: "'DM Sans', sans-serif", label: "DM Sans" },
  { value: "'Outfit', sans-serif", label: "Outfit" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk" },
  { value: "'Work Sans', sans-serif", label: "Work Sans" },
  { value: "'Raleway', sans-serif", label: "Raleway" },
  { value: "'Nunito Sans', sans-serif", label: "Nunito Sans" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Source Sans 3', sans-serif", label: "Source Sans 3" },
  { value: "'Arial', sans-serif", label: "Arial" },
  { value: "'Helvetica', sans-serif", label: "Helvetica" },
  { value: "'Calibri', sans-serif", label: "Calibri" },
  { value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", label: "Segoe UI" },
  // Serif
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Lora', serif", label: "Lora" },
  { value: "'EB Garamond', serif", label: "EB Garamond" },
  { value: "'Cormorant Garamond', serif", label: "Cormorant Garamond" },
  { value: "'Libre Baskerville', serif", label: "Libre Baskerville" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Cinzel', serif", label: "Cinzel" },
  { value: "'Source Serif 4', serif", label: "Source Serif 4" },
  { value: "'Bitter', serif", label: "Bitter" },
  { value: "'Newsreader', serif", label: "Newsreader" },
  { value: "'PT Serif', serif", label: "PT Serif" },
  { value: "'Georgia', serif", label: "Georgia" },
  { value: "'Cambria', serif", label: "Cambria" },
  // Monospace
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "'Fira Code', monospace", label: "Fira Code" },
  { value: "'Source Code Pro', monospace", label: "Source Code Pro" },
  { value: "'IBM Plex Mono', monospace", label: "IBM Plex Mono" },
];

const PADDING_OPTIONS = [
  { value: "1rem", label: "Compact" },
  { value: "1.25rem", label: "Snug" },
  { value: "2rem", label: "Normal" },
  { value: "2.5rem", label: "Roomy" },
  { value: "3rem", label: "Wide" },
];

export interface CustomizerProps {
  styles: ResumeStyles;
  onChange: (styles: ResumeStyles) => void;
  metadata: ResumeMetadata;
  onMetadataChange: (metadata: ResumeMetadata) => void;
  onOpenTemplates: () => void;
  onDownloadPdf: (layout?: ExportLayout) => void;
  onExportMarkdown: () => void;
  onExportBackup: () => void;
  busy?: boolean;
}

function Section({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-slate-200 last:border-0 dark:border-slate-800">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3.5 text-left"
      >
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
          <span className="text-brand-600 dark:text-brand-400">{icon}</span>
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && <div className="space-y-4 px-4 pb-5">{children}</div>}
    </section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span>
        <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] text-slate-400 dark:text-slate-500">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[1.15rem]" : "translate-x-[0.19rem]"
          }`}
        />
      </button>
    </label>
  );
}

export default function Customizer({
  styles,
  onChange,
  metadata,
  onMetadataChange,
  onOpenTemplates,
  onDownloadPdf,
  onExportMarkdown,
  onExportBackup,
  busy = false,
}: CustomizerProps) {
  const theme = getTheme(styles.template);

  // User's custom / base colors (what user has configured or given for heading and text)
  const [userColors, setUserColors] = useState(() => ({
    h1Color: styles.h1Color || DEFAULT_STYLES.h1Color,
    h2Color: styles.h2Color || DEFAULT_STYLES.h2Color,
    h3Color: styles.h3Color || DEFAULT_STYLES.h3Color,
    textColor: styles.textColor || DEFAULT_STYLES.textColor,
    linkColor: styles.linkColor || DEFAULT_STYLES.linkColor,
    iconColor: styles.iconColor || DEFAULT_STYLES.iconColor,
  }));

  const set = <K extends keyof ResumeStyles>(key: K, value: ResumeStyles[K]) => {
    onChange({ ...styles, [key]: value });
    if (
      key === "h1Color" ||
      key === "h2Color" ||
      key === "h3Color" ||
      key === "textColor" ||
      key === "linkColor" ||
      key === "iconColor"
    ) {
      setUserColors((prev) => ({ ...prev, [key]: value }));
    }
  };

  const applyPattern = (pattern: ColorPattern) => {
    onChange({
      ...styles,
      h1Color: pattern.h1Color,
      h2Color: pattern.h2Color,
      h3Color: pattern.h3Color,
      textColor: pattern.textColor,
      linkColor: pattern.linkColor,
      iconColor: pattern.iconColor,
    });
  };

  const applyDefault = () => {
    onChange({
      ...styles,
      h1Color: userColors.h1Color,
      h2Color: userColors.h2Color,
      h3Color: userColors.h3Color,
      textColor: userColors.textColor,
      linkColor: userColors.linkColor,
      iconColor: userColors.iconColor,
    });
  };

  const resetToFactoryDefaults = (event: React.MouseEvent) => {
    event.stopPropagation();
    const factory = {
      h1Color: DEFAULT_STYLES.h1Color,
      h2Color: DEFAULT_STYLES.h2Color,
      h3Color: DEFAULT_STYLES.h3Color,
      textColor: DEFAULT_STYLES.textColor,
      linkColor: DEFAULT_STYLES.linkColor,
      iconColor: DEFAULT_STYLES.iconColor,
    };
    setUserColors(factory);
    onChange({ ...styles, ...factory });
  };

  const applyRandom = () => {
    const randomPattern = generateRandomColorPattern(styles.h1Color);
    applyPattern(randomPattern);
  };

  const themePattern = getThemeColorPattern(theme);

  const isDefaultActive =
    styles.h1Color.toLowerCase() === userColors.h1Color.toLowerCase() &&
    styles.textColor.toLowerCase() === userColors.textColor.toLowerCase();

  const isThemeActive =
    !isDefaultActive && isPatternActive(themePattern, styles);

  const hasCustomizedDefault =
    userColors.h1Color.toLowerCase() !== DEFAULT_STYLES.h1Color.toLowerCase() ||
    userColors.textColor.toLowerCase() !== DEFAULT_STYLES.textColor.toLowerCase();

  const setMeta = (key: keyof ResumeMetadata, value: string) => {
    onMetadataChange({ ...metadata, [key]: value });
  };

  const alignments = [
    { value: "left", icon: <AlignLeft size={16} />, label: "Align left" },
    { value: "center", icon: <AlignCenter size={16} />, label: "Align centre" },
    { value: "right", icon: <AlignRight size={16} />, label: "Align right" },
    { value: "justify", icon: <AlignJustify size={16} />, label: "Justify" },
  ] as const;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Customise</h2>
        <span className="chip">{THEMES.length} themes</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section title="Design" icon={<LayoutTemplate size={15} />}>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white"
                style={{ backgroundColor: theme.accent }}
                aria-hidden="true"
              >
                <LayoutTemplate size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{theme.name}</p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{theme.tags.join(" · ")}</p>
              </div>
            </div>
            <button type="button" onClick={onOpenTemplates} className="btn btn-secondary btn-sm mt-3 w-full">
              Browse themes
            </button>
          </div>

          <div>
            <label className="field-label" htmlFor="font-family">
              Font family
            </label>
            <select
              id="font-family"
              className="field-select"
              value={styles.fontFamily}
              onChange={(event) => set("fontFamily", event.target.value)}
              style={{ fontFamily: styles.fontFamily }}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="field-label">Text alignment</span>
            <div className="segmented w-full">
              {alignments.map((option) => {
                const active = (styles.textAlign || "left") === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`segmented-item flex-1 ${
                      active
                        ? "bg-white text-slate-900 shadow-sm dark:border dark:border-slate-700/80 dark:bg-slate-950 dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                    aria-pressed={active}
                    aria-label={option.label}
                    title={option.label}
                    onClick={() => set("textAlign", option.value)}
                  >
                    {option.icon}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="text-size">
              Base size · {styles.textSize}pt
            </label>
            <input
              id="text-size"
              type="range"
              min="8"
              max="16"
              step="0.5"
              value={Number(styles.textSize) || 10}
              onChange={(event) => set("textSize", event.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="line-height">
                Line height
              </label>
              <input
                id="line-height"
                type="range"
                min="1"
                max="2"
                step="0.05"
                value={Number(styles.lineHeight) || 1.2}
                onChange={(event) => set("lineHeight", event.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="list-columns">
                List columns
              </label>
              <select
                id="list-columns"
                className="field-select"
                value={styles.listColumns}
                onChange={(event) => set("listColumns", Number(event.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="padding">
              Page margins
            </label>
            <select
              id="padding"
              className="field-select"
              value={styles.padding}
              onChange={(event) => set("padding", event.target.value)}
            >
              {PADDING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="section-spacing">
                Section gap
              </label>
              <select
                id="section-spacing"
                className="field-select"
                value={styles.sectionSpacing}
                onChange={(event) => set("sectionSpacing", event.target.value)}
              >
                <option value="0.75rem">Compact</option>
                <option value="1rem">Tight</option>
                <option value="1.5rem">Normal</option>
                <option value="2rem">Airy</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="list-spacing">
                Bullet gap
              </label>
              <select
                id="list-spacing"
                className="field-select"
                value={styles.listSpacing}
                onChange={(event) => set("listSpacing", event.target.value)}
              >
                <option value="0">None</option>
                <option value="0.1rem">Tight</option>
                <option value="0.25rem">Normal</option>
                <option value="0.45rem">Airy</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Color patterns" icon={<Palette size={15} />}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Palettes & one-click styles
            </span>
            <button
              type="button"
              onClick={applyRandom}
              className="btn btn-secondary btn-sm flex items-center gap-1.5 px-2.5 py-1 text-xs"
              title="Apply a random color scheme"
              aria-label="Apply random color pattern"
            >
              <Shuffle size={13} className="text-brand-600 dark:text-brand-400" />
              <span>Random</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Default (as given by user) */}
            <button
              type="button"
              onClick={applyDefault}
              className={`group relative flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all ${
                isDefaultActive
                  ? "border-brand-500 bg-brand-50/80 shadow-xs ring-1 ring-brand-500/30 dark:border-brand-400 dark:bg-slate-800 dark:ring-brand-400/40"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
              }`}
              aria-pressed={isDefaultActive}
              aria-label="Default color pattern"
              title="Default (as given for heading and text)"
            >
              <div className="flex shrink-0 -space-x-1">
                <span
                  className="h-5 w-5 rounded-full border border-white shadow-xs dark:border-slate-800"
                  style={{ backgroundColor: userColors.h1Color }}
                  title={`Heading: ${userColors.h1Color}`}
                />
                <span
                  className="h-5 w-5 rounded-full border border-white shadow-xs dark:border-slate-800"
                  style={{ backgroundColor: userColors.textColor }}
                  title={`Text: ${userColors.textColor}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`truncate text-xs font-semibold ${
                      isDefaultActive
                        ? "text-brand-900 dark:text-brand-300"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    Default
                  </span>
                  {isDefaultActive && (
                    <Check size={12} className="shrink-0 text-brand-600 dark:text-brand-400" />
                  )}
                </div>
                <span
                  className={`block truncate text-[10px] ${
                    isDefaultActive
                      ? "text-brand-700/80 dark:text-brand-400/80"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  As given
                </span>
              </div>
              {hasCustomizedDefault && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={resetToFactoryDefaults}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      resetToFactoryDefaults(event as unknown as React.MouseEvent);
                    }
                  }}
                  className="absolute -top-1.5 -right-1.5 hidden rounded-full bg-slate-200 p-0.5 text-slate-600 hover:bg-slate-300 group-hover:block dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  title="Reset to factory default colors"
                  aria-label="Reset default colors"
                >
                  <RotateCcw size={10} />
                </span>
              )}
            </button>

            {/* Theme Accent (Dynamically matches current template) */}
            <button
              type="button"
              onClick={() => applyPattern(themePattern)}
              className={`group relative flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all ${
                isThemeActive
                  ? "border-brand-500 bg-brand-50/80 shadow-xs ring-1 ring-brand-500/30 dark:border-brand-400 dark:bg-slate-800 dark:ring-brand-400/40"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
              }`}
              aria-pressed={isThemeActive}
              aria-label={`${theme.name} theme color pattern`}
              title={themePattern.description}
            >
              <div className="flex shrink-0 -space-x-1">
                <span
                  className="h-5 w-5 rounded-full border border-white shadow-xs dark:border-slate-800"
                  style={{ backgroundColor: themePattern.h1Color }}
                  title={`Heading: ${themePattern.h1Color}`}
                />
                <span
                  className="h-5 w-5 rounded-full border border-white shadow-xs dark:border-slate-800"
                  style={{ backgroundColor: themePattern.textColor }}
                  title={`Text: ${themePattern.textColor}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`truncate text-xs font-semibold ${
                      isThemeActive
                        ? "text-brand-900 dark:text-brand-300"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    Theme
                  </span>
                  {isThemeActive && (
                    <Check size={12} className="shrink-0 text-brand-600 dark:text-brand-400" />
                  )}
                </div>
                <span
                  className={`block truncate text-[10px] ${
                    isThemeActive
                      ? "text-brand-700/80 dark:text-brand-400/80"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {theme.name}
                </span>
              </div>
            </button>

            {COLOR_PATTERNS.map((pattern) => {
              const active = !isDefaultActive && !isThemeActive && isPatternActive(pattern, styles);
              return (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => applyPattern(pattern)}
                  className={`flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all ${
                    active
                      ? "border-brand-500 bg-brand-50/80 shadow-xs ring-1 ring-brand-500/30 dark:border-brand-400 dark:bg-slate-800 dark:ring-brand-400/40"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                  }`}
                  aria-pressed={active}
                  aria-label={`${pattern.name} color pattern`}
                  title={pattern.description || pattern.name}
                >
                  <div className="flex shrink-0 -space-x-1">
                    <span
                      className="h-5 w-5 rounded-full border border-white shadow-xs dark:border-slate-800"
                      style={{ backgroundColor: pattern.h1Color }}
                      title={`Heading: ${pattern.h1Color}`}
                    />
                    <span
                      className="h-5 w-5 rounded-full border border-white shadow-xs dark:border-slate-800"
                      style={{ backgroundColor: pattern.textColor }}
                      title={`Text: ${pattern.textColor}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`truncate text-xs font-medium ${
                          active
                            ? "text-brand-900 dark:text-brand-300"
                            : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {pattern.name}
                      </span>
                      {active && (
                        <Check size={12} className="shrink-0 text-brand-600 dark:text-brand-400" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Colours & sizes" icon={<Type size={15} />}>
          {(
            [
              { key: "h1", label: "Name / H1", sizeKey: "h1Size" },
              { key: "h2", label: "Sections / H2", sizeKey: "h2Size" },
              { key: "h3", label: "Sub-headings / H3", sizeKey: "h3Size" },
              { key: "text", label: "Body text", sizeKey: "textSize" },
            ] as const
          ).map(({ key, label, sizeKey }) => {
            const colorKey = `${key}Color` as keyof ResumeStyles;
            return (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    aria-label={`${label} colour`}
                    value={String(styles[colorKey])}
                    onChange={(event) => set(colorKey, event.target.value as never)}
                    className="h-7 w-7"
                  />
                  <input
                    type="number"
                    aria-label={`${label} size in points`}
                    value={String(styles[sizeKey])}
                    min={8}
                    max={72}
                    onChange={(event) => set(sizeKey, event.target.value as never)}
                    className="field-input w-14 px-2 py-1 text-xs"
                  />
                  <span className="text-[10px] text-slate-400">pt</span>
                </div>
              </div>
            );
          })}
        </Section>

        <Section title="Links" icon={<Link2 size={15} />} defaultOpen={false}>
          <Toggle
            label="Platform icons"
            hint="Show GitHub, LinkedIn, mail and globe icons next to links."
            checked={styles.showLinkIcons}
            onChange={(value) => set("showLinkIcons", value)}
          />
          <Toggle
            label="Underline links"
            checked={!styles.hideLinkUnderline}
            onChange={(value) => set("hideLinkUnderline", !value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="link-color">
                Link colour
              </label>
              <input
                id="link-color"
                type="color"
                value={styles.linkColor}
                onChange={(event) => set("linkColor", event.target.value)}
                className="h-9 w-full"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="icon-color">
                Icon colour
              </label>
              <input
                id="icon-color"
                type="color"
                value={styles.iconColor}
                onChange={(event) => set("iconColor", event.target.value)}
                className="h-9 w-full"
              />
            </div>
          </div>
        </Section>

        <Section title="Save as PDF" icon={<Printer size={15} />}>
          <div>
            <span className="field-label">Export layout</span>
            <div className="segmented w-full">
              {(
                [
                  { value: "single", label: "Single page (large)" },
                  { value: "paginated", label: "Multi-page (auto)" },
                ] as const
              ).map((layout) => {
                const active = (styles.exportFormat || "single") === layout.value;
                return (
                  <button
                    key={layout.value}
                    type="button"
                    className={`segmented-item flex-1 text-xs ${
                      active
                        ? "bg-white text-slate-900 shadow-sm dark:border dark:border-slate-700/80 dark:bg-slate-950 dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                    aria-pressed={active}
                    onClick={() => set("exportFormat", layout.value)}
                  >
                    {layout.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="field-label">Paper size</span>
            <div className="segmented w-full">
              {(["A4", "Letter"] as const).map((size) => {
                const active = (styles.pageSize || "A4") === size;
                return (
                  <button
                    key={size}
                    type="button"
                    className={`segmented-item flex-1 ${
                      active
                        ? "bg-white text-slate-900 shadow-sm dark:border dark:border-slate-700/80 dark:bg-slate-950 dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                    aria-pressed={active}
                    onClick={() => set("pageSize", size)}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="field-hint">
            {(styles.exportFormat || "single") === "single"
              ? "Saves as a single continuous large PDF matching the exact preview ratio."
              : "Splits automatically across multiple standard A4 or Letter sheets with auto page breaks and ::page-break:: support. Ideal for physical printing."}
          </p>

          {(styles.exportFormat || "single") === "single" && (
            <div className="surface-muted rounded-xl p-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                <Printer size={14} className="shrink-0 text-brand-600 dark:text-brand-400" />
                Single-page PDF setup in print dialog:
              </p>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">1.</span>
                  <span>
                    Destination &rarr;{" "}
                    <strong className="font-semibold text-slate-900 dark:text-white">Save as PDF</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">2.</span>
                  <span>
                    Margins &rarr;{" "}
                    <strong className="font-semibold text-slate-900 dark:text-white">None</strong>{" "}
                    <span className="text-slate-500 dark:text-slate-400">(prevents multi-page splits)</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">3.</span>
                  <span>
                    More settings &rarr; Check{" "}
                    <strong className="font-semibold text-slate-900 dark:text-white">Background graphics</strong>
                  </span>
                </li>
              </ul>
            </div>
          )}

          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => onDownloadPdf(styles.exportFormat || "single")}
              disabled={busy}
              className="btn btn-primary w-full"
            >
              <Printer size={15} />
              {busy
                ? "Opening print…"
                : (styles.exportFormat || "single") === "single"
                  ? "Save as PDF (Single page)…"
                  : "Save as PDF (Multi-page)…"}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={onExportMarkdown} className="btn btn-secondary btn-sm">
                <FileText size={14} /> Markdown
              </button>
              <button type="button" onClick={onExportBackup} className="btn btn-secondary btn-sm">
                <FileJson size={14} /> Backup
              </button>
            </div>
            <p className="field-hint">
              No file is generated remotely; your browser prints locally. Choose <strong>Save as PDF</strong> in the
              destination. If print preview freezes, press <strong>Ctrl + Shift + P</strong> for system print.
            </p>
          </div>
        </Section>

        <Section title="Document title" icon={<FileText size={15} />} defaultOpen={false}>
          <div>
            <label className="field-label" htmlFor="meta-title">
              PDF title
            </label>
            <input
              id="meta-title"
              className="field-input"
              value={metadata.title ?? ""}
              onChange={(event) => setMeta("title", event.target.value)}
              placeholder="Alex Morgan — Resume"
            />
          </div>
          <p className="field-hint">
            Used as the document title (and therefore the PDF title) in the print dialog. Browsers do not let a page
            set author, subject or keyword metadata when printing.
          </p>
        </Section>
      </div>
    </div>
  );
}
