import type { ElementNode, MarkdownDocument, Node } from "comark";
import { createMarkdownParser } from "comark";
import { resolveAttributes } from "comark/utils";
import type { Plugin } from "vite";
import type { z } from "zod";
import { CV_SPEC, cvFrontmatterSchema } from "../src/content/cv-schema.ts";
import { frontmatterSchema, SPEC } from "../src/content/schema.ts";

/**
 * Tags the parser is expected to emit for plain markdown. Anything outside
 * this set and outside the document's directive spec is a component the
 * renderer has no entry for — almost always a typo in a `::name`, which would
 * otherwise render as an unstyled unknown element rather than fail.
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

/** Block-level tags that must not appear inside `::summary`, which renders a `<p>`. */
const BLOCK_TAGS = new Set([
	"p",
	"ul",
	"ol",
	"blockquote",
	"pre",
	"table",
	"div",
]);

type DirectiveSpec = Record<
	string,
	{ attrs: z.ZodType; invariant: readonly string[] }
>;

type DocumentSpec = {
	frontmatter: z.ZodType;
	directives: DirectiveSpec;
	extra?: (document: MarkdownDocument) => string[];
};

/**
 * One spec per document kind, keyed by basename — every locale directory
 * holds the same set of documents, so `en/cv.md` and `de/cv.md` share a spec
 * and are parity-checked against each other, never against `site.md`.
 */
const DOCUMENTS: Record<string, DocumentSpec> = {
	"site.md": { frontmatter: frontmatterSchema, directives: SPEC },
	"cv.md": {
		frontmatter: cvFrontmatterSchema,
		directives: CV_SPEC,
		extra: summaryHoldsInlineProse,
	},
};

const isElement = (node: Node): node is ElementNode =>
	Array.isArray(node) && typeof node[0] === "string";

/** Slicing a tuple type widens to include the attributes slot, hence the cast. */
const children = (node: ElementNode): Node[] => node.slice(2) as Node[];

/** `…/content/<locale>/<basename>.md` → the two names, or null for other md. */
const dissectPath = (id: string) =>
	id.match(/\/([a-z-]+)\/([a-z-]+\.md)$/)?.slice(1) as
		| [locale: string, basename: string]
		| null;

/**
 * Parses content markdown to a Comark AST at build time and emits it as JSON.
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
	/** basename → file id → directive id → invariant signature */
	const identifiers = new Map<string, Map<string, Map<string, string>>>();

	return {
		name: "comark",

		async transform(code, id) {
			if (!id.endsWith(".md")) return;

			const document = await parse(code);
			const names = dissectPath(id);
			const spec = names ? DOCUMENTS[names[1]] : undefined;

			if (names && spec) {
				const issues = validate(document, spec);

				// A frontmatter locale that disagrees with the directory would
				// prerender the wrong language tag.
				if (document.frontmatter.locale !== names[0]) {
					issues.push(
						`frontmatter locale "${String(document.frontmatter.locale)}" does not match directory "${names[0]}"`,
					);
				}

				if (issues.length > 0) {
					this.error(`${id}\n  ${issues.join("\n  ")}`);
				}

				const ofBasename =
					identifiers.get(names[1]) ?? new Map<string, Map<string, string>>();
				identifiers.set(names[1], ofBasename);
				ofBasename.set(id, collectIds(document, spec.directives));
			} else if (names) {
				this.error(`${id} has no document spec — add one to vite/comark.ts`);
			}

			// U+2028/U+2029 are legal in JSON strings and, historically, not in JS
			// ones. Escaping them keeps the emitted module parseable everywhere.
			const json = JSON.stringify(document)
				.replace(/\u2028/g, "\\u2028")
				.replace(/\u2029/g, "\\u2029");

			return { code: `export default ${json}`, map: null };
		},

		/**
		 * The locales are parallel documents, and markdown gives no diff-shaped
		 * view of that — so entries are compared across locales instead: an entry
		 * present in one language and absent from another fails the build, and so
		 * does a locale-invariant attribute (a year, a date span, an org) that
		 * was corrected in one file and left stale in another.
		 */
		buildEnd() {
			for (const ofBasename of identifiers.values()) {
				const files = [...ofBasename.keys()].sort();
				if (files.length < 2) continue;

				const [reference, ...others] = files;
				const expected = ofBasename.get(reference) as Map<string, string>;

				for (const file of others) {
					const actual = ofBasename.get(file) as Map<string, string>;
					const missing = [...expected.keys()].filter(
						(key) => !actual.has(key),
					);
					const extra = [...actual.keys()].filter((key) => !expected.has(key));
					const drifted = [...expected.keys()].filter(
						(key) => actual.has(key) && actual.get(key) !== expected.get(key),
					);
					if (missing.length > 0 || extra.length > 0 || drifted.length > 0) {
						this.error(
							`${file} does not match ${reference}:` +
								(missing.length > 0
									? `\n  missing: ${missing.join(", ")}`
									: "") +
								(extra.length > 0
									? `\n  unexpected: ${extra.join(", ")}`
									: "") +
								(drifted.length > 0
									? `\n  invariant attributes differ on: ${drifted.join(", ")}`
									: ""),
						);
					}
				}
			}
		},
	};
}

/** id → serialized invariant attributes, e.g. "role#noah-lead" → org/from/to. */
function collectIds(
	document: MarkdownDocument,
	directives: DirectiveSpec,
): Map<string, string> {
	const ids = new Map<string, string>();
	walk(document.nodes, (node) => {
		const spec = directives[node[0]];
		if (!spec) return;
		const attrs = resolveAttributes(
			node[1],
			{
				frontmatter: document.frontmatter,
				meta: document.meta,
				data: {},
				props: {},
			},
			{ parseJson: true },
		);
		// Attribute-less directives (::summary, ::skills) still count for parity.
		const key = `${node[0]}#${typeof attrs.id === "string" ? attrs.id : ""}`;
		ids.set(
			key,
			JSON.stringify(spec.invariant.map((name) => attrs[name] ?? null)),
		);
	});
	return ids;
}

function validate(document: MarkdownDocument, spec: DocumentSpec): string[] {
	const issues: string[] = [];
	const renderData = {
		frontmatter: document.frontmatter,
		meta: document.meta,
		data: {},
		props: {},
	};

	const front = spec.frontmatter.safeParse(document.frontmatter);
	if (!front.success) {
		for (const issue of front.error.issues) {
			issues.push(
				`frontmatter ${issue.path.join(".") || "(root)"}: ${issue.message}`,
			);
		}
	}

	walk(document.nodes, (node) => {
		const tag = node[0];

		const directive = spec.directives[tag];
		if (!directive) {
			if (!HTML_TAGS.has(tag)) {
				issues.push(`<${tag}> is not a known component or element`);
			}
			return;
		}

		const attrs = resolveAttributes(node[1], renderData, { parseJson: true });
		const where = `<${tag}${typeof attrs.id === "string" ? ` #${attrs.id}` : ""}>`;

		const result = directive.attrs.safeParse(attrs);
		if (!result.success) {
			for (const issue of result.error.issues) {
				issues.push(
					`${where} ${issue.path.join(".") || "(attrs)"}: ${issue.message}`,
				);
			}
		}
	});

	issues.push(...(spec.extra?.(document) ?? []));

	return issues;
}

/** `::summary` renders a `<p>`; a block tag nested inside would be invalid HTML. */
function summaryHoldsInlineProse(document: MarkdownDocument): string[] {
	const issues: string[] = [];
	walk(document.nodes, (node) => {
		if (node[0] !== "summary") return;
		const block = children(node).find(
			(child) => isElement(child) && BLOCK_TAGS.has(child[0]),
		);
		if (block) {
			issues.push(
				`<summary> must hold one paragraph of inline prose — found <${(block as ElementNode)[0]}>, which would nest a block inside the <p> it renders`,
			);
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
