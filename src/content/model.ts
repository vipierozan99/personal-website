import type { ElementNode, MarkdownDocument, Node } from "comark";
import { resolveAttributes } from "comark/utils";
import {
	PEOPLE,
	type PersonFacts,
	PROJECTS,
	type ProjectFacts,
	TOPICS,
	type TopicFacts,
} from "./data";
import type {
	PersonAttrs,
	ProjectAttrs,
	SiteFrontmatter,
	TopicAttrs,
} from "./schema";

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

export type Project = ProjectFacts &
	ProjectAttrs & { blurb: Fragment; detail: Fragment };
export type Topic = TopicFacts & TopicAttrs & { gloss: Fragment };
export type Person = PersonFacts & PersonAttrs & { note: Fragment };

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

/**
 * Joins the document's directives to the typed facts in `data.ts`, by id.
 *
 * Throws on any drift — an id present in one and absent from the other is a
 * content bug that must fail the build (the prerender runs this) rather than
 * render a half-empty section. Order comes from `data.ts`, so all locales
 * list in the same order regardless of how the markdown is arranged.
 */
export function buildContent(doc: SiteDocument): SiteContent {
	const preamble: ElementNode[] = [];
	const byTag = new Map<string, Map<string, ElementNode>>();

	for (const node of doc.nodes) {
		if (!isElement(node)) continue;
		if (node[0] === "project" || node[0] === "topic" || node[0] === "person") {
			const { id } = attrsOf<{ id: string }>(node, doc);
			const ofTag = byTag.get(node[0]) ?? new Map<string, ElementNode>();
			byTag.set(node[0], ofTag);
			ofTag.set(id, node);
		} else {
			preamble.push(node);
		}
	}

	const pick = (tag: string, id: string): ElementNode => {
		const node = byTag.get(tag)?.get(id);
		if (!node) {
			throw new Error(
				`site.${doc.frontmatter.locale}.md has no ::${tag}{#${id}} — data.ts expects one`,
			);
		}
		byTag.get(tag)?.delete(id);
		return node;
	};

	const content: SiteContent = {
		frontmatter: doc.frontmatter,
		intro: splitIntro(preamble),
		projects: PROJECTS.map((facts) => {
			const node = pick("project", facts.id);
			const [blurb, ...detail] = children(node);
			return {
				...facts,
				...attrsOf<ProjectAttrs>(node, doc),
				blurb: { nodes: blurb ? [blurb] : [] },
				detail: { nodes: detail },
			};
		}),
		topics: TOPICS.map((facts) => {
			const node = pick("topic", facts.id);
			return {
				...facts,
				...attrsOf<TopicAttrs>(node, doc),
				gloss: { nodes: children(node) },
			};
		}),
		people: PEOPLE.map((facts) => {
			const node = pick("person", facts.id);
			return {
				...facts,
				...attrsOf<PersonAttrs>(node, doc),
				note: { nodes: children(node) },
			};
		}),
	};

	const leftover = [...byTag.entries()]
		.flatMap(([tag, ofTag]) => [...ofTag.keys()].map((id) => `${tag}#${id}`))
		.join(", ");
	if (leftover) {
		throw new Error(
			`site.${doc.frontmatter.locale}.md has entries data.ts does not: ${leftover}`,
		);
	}

	return content;
}

/** Bio runs to the blockquote, the lead-in follows it. */
function splitIntro(preamble: ElementNode[]): SiteContent["intro"] {
	const at = preamble.findIndex((node) => node[0] === "blockquote");
	if (at < 0) {
		throw new Error("the intro has no blockquote to use as the pull quote");
	}
	return {
		bio: { nodes: preamble.slice(0, at) },
		quote: { nodes: children(preamble[at]) },
		lead: { nodes: preamble.slice(at + 1) },
	};
}
