import { MarkdownDocument } from "@comark/react";
import type { ElementNode, Node } from "comark";
import type { ReactNode } from "react";
import type { Fragment } from "../content/model";

/**
 * Renders a block-level slice of the document. `display: contents` removes
 * the renderer's wrapper div from the layout, so typography is owned entirely
 * by the surrounding element. Plain tags need no component map — link color
 * is the base-layer `a` rule.
 */
export function Prose({ value }: { value: Fragment }) {
	return <MarkdownDocument value={value} className="contents" />;
}

const isElement = (node: Node): node is ElementNode =>
	Array.isArray(node) && typeof node[0] === "string";

/**
 * Renders an inline fragment — a paragraph's children — with no wrapper at
 * all. `<MarkdownDocument>` always emits a div, which the HTML parser evicts
 * from `<p>` and phrasing contexts like `<button>`, breaking hydration; the
 * inline vocabulary is small enough to walk directly.
 */
export function InlineProse({ value }: { value: Fragment }) {
	return <>{value.nodes.map(renderInline)}</>;
}

function renderInline(node: Node, key: number): ReactNode {
	if (typeof node === "string") return node;
	if (!isElement(node)) return null;

	const [tag, attrs, ...rest] = node;
	const children = (rest as Node[]).map(renderInline);

	switch (tag) {
		case "a":
			return (
				<a key={key} href={String(attrs.href ?? "#")}>
					{children}
				</a>
			);
		case "strong":
		case "em":
		case "code":
		case "del":
		case "span": {
			const Tag = tag;
			return <Tag key={key}>{children}</Tag>;
		}
		case "br":
			return <br key={key} />;
		default:
			// An unexpected block tag inside an inline fragment would be an
			// authoring bug; rendering its text keeps the content readable.
			return <span key={key}>{children}</span>;
	}
}
