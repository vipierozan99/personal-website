import type { ElementNode, MarkdownDocument, Node } from "comark";
import { resolveAttributes } from "comark/utils";
// Types only: the zod schemas behind them are build-time, in vite/comark.ts.
import type {
	PersonAttrs,
	ProjectAttrs,
	SiteFrontmatter,
	TopicAttrs,
} from "./schema";

/** "Python · Kafka" / "vox, site" → trimmed items; both separators accepted. */
const splitList = (value: string | undefined): string[] =>
	(value ?? "")
		.split(/[·,]/)
		.map((item) => item.trim())
		.filter(Boolean);

/**
 * A slice of a parsed document, renderable on its own by `<MarkdownDocument>`.
 * The AST is a flat array of plain tuples, so slicing it is free — no reparse,
 * no serialization.
 */
export type Fragment = { nodes: Node[] };

export type SiteDocument = MarkdownDocument<
	Record<string, unknown>,
	SiteFrontmatter
>;

export type Project = Omit<ProjectAttrs, "stack"> & {
	stack: string[];
	blurb: Fragment;
	detail: Fragment;
};

type Topic = Omit<TopicAttrs, "projects"> & {
	/** ::project ids this topic cross-lights, and vice versa. */
	projects: string[];
	gloss: Fragment;
};

type PersonLink = { label: string; href: string };

type Person = PersonAttrs & { note: Fragment; links: PersonLink[] };

export type SiteContent = {
	frontmatter: SiteFrontmatter;
	/** Everything before the first directive: bio paragraphs, the pull quote,
	 *  and the lead-in line, split so each can carry its own anchor and style. */
	intro: { bio: Fragment; quote: Fragment; lead: Fragment };
	projects: Project[];
	topics: Topic[];
	people: Person[];
};

const isElement = (node: Node): node is ElementNode =>
	Array.isArray(node) && typeof node[0] === "string";

const children = (node: ElementNode): Node[] => node.slice(2) as Node[];

function attrsOf<T>(node: ElementNode, doc: SiteDocument): T {
	return resolveAttributes(
		node[1],
		{ frontmatter: doc.frontmatter, meta: doc.meta, data: {}, props: {} },
		{ parseJson: true },
	) as T;
}

/** A single paragraph unwraps to its inline children, so prose can sit inside
 *  the `<button>` rows without nesting a block element in phrasing content. */
const inline = (nodes: Node[]): Fragment =>
	nodes.length === 1 && isElement(nodes[0]) && nodes[0][0] === "p"
		? { nodes: children(nodes[0]) }
		: { nodes };

/**
 * Shapes a parsed `site.<locale>.md` into what the sections render, in
 * document order. The Vite plugin has already validated attributes and
 * cross-locale parity; the checks here are the ones that need the joined
 * view — a topic naming a project that does not exist fails the build,
 * because the prerender runs this.
 */
export function buildContent(doc: SiteDocument): SiteContent {
	const preamble: ElementNode[] = [];
	const projects: Project[] = [];
	const topics: Topic[] = [];
	const people: Person[] = [];

	for (const node of doc.nodes) {
		if (!isElement(node)) continue;
		switch (node[0]) {
			case "project": {
				const { stack, year, ...attrs } = attrsOf<ProjectAttrs>(node, doc);
				const [blurb, ...detail] = children(node);
				projects.push({
					...attrs,
					// The parser hands every attribute over as a string.
					year: Number(year),
					stack: splitList(stack),
					blurb: inline(blurb ? [blurb] : []),
					detail: { nodes: detail },
				});
				break;
			}
			case "topic": {
				const { projects: related, ...attrs } = attrsOf<TopicAttrs>(node, doc);
				topics.push({
					...attrs,
					projects: splitList(related),
					gloss: inline(children(node)),
				});
				break;
			}
			case "person": {
				const attrs = attrsOf<PersonAttrs>(node, doc);
				people.push({ ...attrs, ...splitNote(children(node)) });
				break;
			}
			default:
				preamble.push(node);
		}
	}

	const known = new Set(projects.map((project) => project.id));
	for (const topic of topics) {
		for (const id of topic.projects) {
			if (!known.has(id)) {
				throw new Error(
					`site.${doc.frontmatter.locale}.md: topic #${topic.id} names unknown project "${id}"`,
				);
			}
		}
	}

	return {
		frontmatter: doc.frontmatter,
		intro: splitIntro(preamble),
		projects,
		topics,
		people,
	};
}

/** Bio runs to the blockquote, the lead-in follows it. */
function splitIntro(preamble: ElementNode[]): SiteContent["intro"] {
	const at = preamble.findIndex((node) => node[0] === "blockquote");
	if (at < 0) {
		throw new Error("the intro has no blockquote to use as the pull quote");
	}
	return {
		bio: { nodes: preamble.slice(0, at) },
		quote: inline(children(preamble[at])),
		lead: { nodes: preamble.slice(at + 1) },
	};
}

/**
 * A person's body is the note, except a final paragraph made only of links —
 * that one is the card's link list, kept as data so the layout can stack it
 * under the name rather than leave it inside the prose.
 */
function splitNote(nodes: Node[]): { note: Fragment; links: PersonLink[] } {
	const last = nodes.at(-1);
	if (last && isElement(last) && last[0] === "p") {
		const parts = children(last).filter(
			(child) => !(typeof child === "string" && child.trim() === ""),
		);
		if (
			parts.length > 0 &&
			parts.every((child) => isElement(child) && child[0] === "a")
		) {
			return {
				note: { nodes: nodes.slice(0, -1) },
				links: (parts as ElementNode[]).map((anchor) => ({
					label: children(anchor).join(""),
					href: String(anchor[1].href ?? "#"),
				})),
			};
		}
	}
	return { note: { nodes }, links: [] };
}
