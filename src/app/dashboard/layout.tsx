import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description:
        "Manage and build your markdown-powered resumes. Create, edit, and organize multiple resume versions.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
