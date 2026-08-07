import type { ElementNode, MarkdownDocument, Node } from "comark";
import { createMarkdownParser } from "comark";
import { resolveAttributes } from "comark/utils";
import type { Plugin } from "vite";
import { FRONTMATTER_KEYS, SPEC } from "../src/content/schema.ts";

/**
 * Tags the parser is expected to emit for plain markdown. Anything outside
 * this set and outside `SPEC` is a component the renderer has no entry for —
 * almost always a typo in a `::name`, which would otherwise render as an
 * unstyled unknown element rather than fail.
 */
const HTML_TAGS = new Set([
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"p",
	"ul",
	"ol",
	"li",
	"a",
	"strong",
	"em",
	"del",
	"code",
	"pre",
	"blockquote",
	"hr",
	"br",
	"img",
	"span",
	"div",
	"template",
]);

const isElement = (node: Node): node is ElementNode =>
	Array.isArray(node) && typeof node[0] === "string";

/** Slicing a tuple type widens to include the attributes slot, hence the cast. */
const children = (node: ElementNode): Node[] => node.slice(2) as Node[];

/**
 * Parses `site.*.md` to a Comark AST at build time and emits it as JSON.
 *
 * Doing it here rather than in the browser is the whole point:
 * `<MarkdownDocument>` renders a pre-parsed tree, so the parser never enters
 * the client bundle, and `import.meta.glob` still gives one lazily-loaded
 * chunk per language.
 *
 * `linkify` is off because it is actively wrong for this content — it turns
 * "B.Sc." into a link to `http://B.Sc`. Every link is written out.
 */
export function comark(): Plugin {
	const parse = createMarkdownParser({ linkify: false });
	const identifiers = new Map<string, Set<string>>();

	return {
		name: "comark",

		async transform(code, id) {
			if (!id.endsWith(".md")) return;

			const document = await parse(code);
			const issues = validate(document);
			if (issues.length > 0) {
				this.error(`${id}\n  ${issues.join("\n  ")}`);
			}

			identifiers.set(id, collectIds(document));

			// U+2028/U+2029 are legal in JSON strings and, historically, not in JS
			// ones. Escaping them keeps the emitted module parseable everywhere.
			const json = JSON.stringify(document)
				.replace(/\u2028/g, "\\u2028")
				.replace(/\u2029/g, "\\u2029");

			return { code: `export default ${json}`, map: null };
		},

		/**
		 * The locales are parallel documents, and markdown gives no diff-shaped
		 * view of that — so the ids are compared across locales instead: a project
		 * present in one language and absent from another fails the build. This is
		 * what lets `site.de.md` start as a copy of the English and never silently
		 * drift structurally.
		 */
		buildEnd() {
			const files = [...identifiers.keys()].sort();
			if (files.length < 2) return;

			const [reference, ...others] = files;
			const expected = identifiers.get(reference) as Set<string>;

			for (const file of others) {
				const actual = identifiers.get(file) as Set<string>;
				const missing = [...expected].filter((key) => !actual.has(key));
				const extra = [...actual].filter((key) => !expected.has(key));
				if (missing.length > 0 || extra.length > 0) {
					this.error(
						`${file} does not match ${reference}:` +
							(missing.length > 0 ? `\n  missing: ${missing.join(", ")}` : "") +
							(extra.length > 0 ? `\n  unexpected: ${extra.join(", ")}` : ""),
					);
				}
			}
		},
	};
}

function collectIds(document: MarkdownDocument): Set<string> {
	const ids = new Set<string>();
	walk(document.nodes, (node) => {
		if (!(node[0] in SPEC)) return;
		const id = node[1].id;
		if (typeof id === "string") ids.add(`${node[0]}#${id}`);
	});
	return ids;
}

function validate(document: MarkdownDocument): string[] {
	const issues: string[] = [];
	const renderData = {
		frontmatter: document.frontmatter,
		meta: document.meta,
		data: {},
		props: {},
	};

	for (const key of FRONTMATTER_KEYS) {
		if (typeof document.frontmatter[key] !== "string") {
			issues.push(`frontmatter is missing "${key}"`);
		}
	}

	walk(document.nodes, (node) => {
		const tag = node[0];

		if (!(tag in SPEC)) {
			if (!HTML_TAGS.has(tag)) {
				issues.push(`<${tag}> is not a known component or element`);
			}
			return;
		}

		const spec = SPEC[tag as keyof typeof SPEC];
		const attrs = resolveAttributes(node[1], renderData, { parseJson: true });
		const where = `<${tag}${typeof attrs.id === "string" ? ` #${attrs.id}` : ""}>`;

		for (const key of spec.required) {
			if (attrs[key] === undefined) issues.push(`${where} is missing ${key}`);
		}

		const known = new Set<string>([...spec.required, ...spec.optional]);
		for (const key of Object.keys(attrs)) {
			if (!known.has(key)) issues.push(`${where} has unknown attribute ${key}`);
		}
	});

	return issues;
}

function walk(nodes: readonly Node[], visitor: (node: ElementNode) => void) {
	for (const node of nodes) {
		if (!isElement(node)) continue;
		visitor(node);
		walk(children(node), visitor);
	}
}
