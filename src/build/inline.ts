import type { ElementNode, Node } from "comark";
import { isElement, textOf } from "../content/cv-model";

/**
 * AST primitives shared by the build-time artifact emitters.
 *
 * Everything in `src/build/` runs only inside the SSR bundle, reached from
 * `src/entry-server.tsx` — never from `src/main.tsx`. That is what keeps it
 * (and `content/identity.ts`, which is data and would not tree-shake) out of
 * the app bundle. These emitters also cannot touch `node:fs`: they live under
 * `tsconfig.app.json`, and the project deliberately carries no `@types/node`.
 * They are pure string producers, and `scripts/prerender.js` does all the I/O.
 */

export const children = (node: ElementNode): Node[] => node.slice(2) as Node[];

/** A predicate for finding one child by tag, for `.find()` / `.filter()`. */
export const isTag =
	(tag: string) =>
	(node: Node): node is ElementNode =>
		isElement(node) && node[0] === tag;

/**
 * A node's text, as one line. The collapse is not cosmetic: the content is
 * hard-wrapped at ~78 columns, so every text node carries soft newlines that
 * would otherwise survive into a JSON string.
 */
export const plainText = (node: Node): string =>
	textOf(node).replace(/\s+/g, " ").trim();

/** The build date, as `YYYY-MM-DD`. */
export const isoDay = (now: Date): string => now.toISOString().slice(0, 10);
