interface GuidePreviewProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Static, non-scrollable "paper" surface used to illustrate guide examples.
 * It renders plain HTML (no Markdown engine) and auto-fits its content
 * height (with a sensible min-height so short examples still look like paper).
 */
export default function GuidePreview({ children, className = "" }: GuidePreviewProps) {
    return (
        <div
            className={`bg-white text-slate-900 rounded-md border border-slate-200 shadow-sm overflow-hidden ${className}`}
            style={{ width: "100%", minHeight: "160px" }}
        >
            <div className="p-5 flex flex-col justify-center">{children}</div>
        </div>
    );
}
