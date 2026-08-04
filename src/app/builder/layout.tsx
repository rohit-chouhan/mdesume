import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Resume Builder",
    description:
        "Edit your resume in Markdown with a live preview, customize styles, and export to PDF — all in your browser.",
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
    return children;
}
