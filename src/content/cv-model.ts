import type { ElementNode, MarkdownDocument, Node } from "comark";
import { resolveAttributes } from "comark/utils";
import type { CvFrontmatter } from "./cv-schema";
import type { Fragment } from "./model";

/** A parsed `cv.md`: typed frontmatter, plus the AST to dissect. */
export type CvDocument = MarkdownDocument<
	Record<string, unknown>,
	CvFrontmatter
>;

export const fragment = (nodes: Node[]): Fragment => ({ nodes });

/**
 * A comment node is also an array, with `null` in the tag slot, so the tag
 * has to be checked rather than just the shape.
 */
export const isElement = (node: Node): node is ElementNode =>
	Array.isArray(node) && typeof node[0] === "string";

/**
 * The text of a node, ignoring any markup inside it. Deliberately not
 * comark's `textContent`: that one can also decode HTML entities, and
 * importing it pulls a ~56 kB named-character table into the bundle whose
 * only use for it is reading a heading.
 */
export const textOf = (node: Node): string =>
	typeof node === "string"
		? node
		: isElement(node)
			? (node.slice(2) as Node[]).map(textOf).join("")
			: "";

/**
 * A node's attributes, normalised the way the React renderer normalises them:
 * `{break}` is stored as `":break": "true"` and only becomes `break: true`
 * once bindings are resolved — reading raw `node[1]` would see neither.
 */
export function attrsOf<T>(node: ElementNode, doc: CvDocument): T {
	return resolveAttributes(
		node[1],
		{ frontmatter: doc.frontmatter, meta: doc.meta, data: {}, props: {} },
		{ parseJson: true },
	) as T;
}

export type Section = {
	/** The heading's slug, used as a fallback block key. */
	id: string;
	/** The heading's text — it is the section rule's label. */
	label: string;
	/** Set by `{.closing}` on the heading: laid out together at the end
	 *  rather than flowing as its own block. */
	closing: boolean;
	nodes: ElementNode[];
};

/**
 * Groups the document's flat top-level node list into sections at each `h2`.
 * Nodes before the first heading are the preamble. Comark headings do not
 * nest their following siblings, so a "section" is a derived view rather
 * than a subtree — convenient, because the flat list is already
 * one-node-per-paginator-block.
 */
export function dissect(doc: CvDocument): {
	preamble: ElementNode[];
	sections: Section[];
} {
	const preamble: ElementNode[] = [];
	const sections: Section[] = [];

	for (const node of doc.nodes) {
		if (!isElement(node)) continue;

		if (node[0] === "h2") {
			const attrs = node[1];
			sections.push({
				id:
					typeof attrs.id === "string"
						? attrs.id
						: `section-${sections.length}`,
				label: textOf(node),
				closing: String(attrs.class ?? "")
					.split(/\s+/)
					.includes("closing"),
				nodes: [],
			});
			continue;
		}

		(sections.at(-1)?.nodes ?? preamble).push(node);
	}

	return { preamble, sections };
}
