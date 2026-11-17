import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { normalizeDirectives, remarkResumeDirectives, type MdNode } from "@/lib/markdown";

export function parseResume(markdown: string): MdNode {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkResumeDirectives);
  const tree = processor.parse(normalizeDirectives(markdown));
  return processor.runSync(tree) as MdNode;
}

export function collectClassNames(tree: MdNode): string[] {
  const found: string[] = [];
  const walk = (node: MdNode) => {
    const className = node.data?.hProperties?.className;
    if (typeof className === "string") found.push(...className.split(/\s+/).filter(Boolean));
    (node.children ?? []).forEach(walk);
  };
  walk(tree);
  return found;
}

export function findNodes(tree: MdNode, predicate: (node: MdNode) => boolean): MdNode[] {
  const found: MdNode[] = [];
  const walk = (node: MdNode) => {
    if (predicate(node)) found.push(node);
    (node.children ?? []).forEach(walk);
  };
  walk(tree);
  return found;
}

export function collectText(tree: MdNode): string {
  if (tree.type === "text" || tree.type === "inlineCode") return tree.value ?? "";
  return (tree.children ?? []).map(collectText).join("");
}

export function findHName(tree: MdNode, hName: string): MdNode[] {
  return findNodes(tree, (node) => node.data?.hName === hName);
}
