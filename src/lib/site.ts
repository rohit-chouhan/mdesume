/** Base-aware URL helper so the static site works on GitHub Pages project paths. */
const rawBase = import.meta.env.BASE_URL || "/";
export const basePath = rawBase === "/" ? "" : rawBase.replace(/\/+$/, "");

export function href(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}` || "/";
}

export function isActivePath(currentPath: string, target: string): boolean {
  const base = target.replace(/\/+$/, "") || "/";
  const current = currentPath.replace(basePath, "").replace(/\/+$/, "") || "/";
  if (base === "/") return current === "/";
  return current === base || current.startsWith(`${base}/`);
}
