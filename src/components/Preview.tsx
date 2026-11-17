import { memo, useDeferredValue, useMemo } from "react";
import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Code, Globe, Mail } from "lucide-react";
import { normalizeDirectives, remarkResumeDirectives } from "@/lib/markdown";

interface IconProps {
  size?: number;
  className?: string;
}

const GithubIcon = ({ size = 12, className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 12, className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export interface PreviewProps {
  markdown: string;
  showLinkIcons?: boolean;
  hideLinkUnderline?: boolean;
}

/**
 * react-markdown's default transform blanks `data:` URLs, which would silently
 * remove generated QR codes. Allow base64 images only; every other URL keeps the
 * library's safe default (javascript:, vbscript:, etc. are still blocked).
 */
const DATA_IMAGE = /^data:image\/(?:gif|png|jpeg|jpg|webp|svg\+xml);base64,[a-z0-9+/=]+$/i;

function urlTransform(url: string, key: string): string {
  if (key === "src" && DATA_IMAGE.test(url)) return url;
  return defaultUrlTransform(url);
}

const Preview = ({ markdown, showLinkIcons = true, hideLinkUnderline = true }: PreviewProps) => {
  // Parsing the whole document is the most expensive work here; deferring keeps
  // typing responsive and drops intermediate renders while the user types fast.
  const deferred = useDeferredValue(markdown);
  const normalized = useMemo(() => normalizeDirectives(deferred), [deferred]);
  const plugins = useMemo(() => [remarkGfm, remarkResumeDirectives], []);

  const components = useMemo<Components>(
    () => ({
      a: ({ node, href, children, ...props }) => {
        const properties = (node?.properties ?? {}) as Record<string, unknown>;
        const isNoIcon =
          properties["data-no-icon"] === "true" ||
          (props as Record<string, unknown>)["data-no-icon"] === "true" ||
          (props as Record<string, unknown>)["data-no-icon"] === true;

        const linkStyle = {
          color: "var(--resume-link-color, #2563eb)",
          textDecoration: hideLinkUnderline ? "none" : "underline",
        } as const;

        if (isNoIcon || !showLinkIcons || !href) {
          return (
            <a href={href} {...props} target="_blank" rel="noopener noreferrer" className="resume-link" style={linkStyle}>
              {children}
            </a>
          );
        }

        let Icon: React.ComponentType<IconProps> = Globe;
        if (href.includes("github.com")) Icon = GithubIcon;
        else if (href.includes("linkedin.com")) Icon = LinkedinIcon;
        else if (href.includes("leetcode.com")) Icon = Code;
        else if (href.startsWith("mailto:")) Icon = Mail;

        return (
          <a
            href={href}
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="resume-link resume-link--icon"
            style={linkStyle}
          >
            <Icon size={12} className="resume-link-icon" />
            <span className="resume-link-label">{children}</span>
          </a>
        );
      },
    }),
    [showLinkIcons, hideLinkUnderline],
  );

  return (
    <ReactMarkdown remarkPlugins={plugins} components={components} urlTransform={urlTransform}>
      {normalized}
    </ReactMarkdown>
  );
};

export default memo(Preview);
