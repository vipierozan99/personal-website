/**
 * The contract between `site.*.md` and the components that render it.
 *
 * Markdown attributes arrive from the parser as `Record<string, unknown>`, so
 * these types are not enforced at the authoring boundary — `SPEC` below is
 * what actually checks a document, at build time, in the Vite plugin.
 *
 * The split rule: display text that a translator touches lives in the `.md`
 * (titles, metas, link labels, all prose); facts that are the same in every
 * language live in `src/content/data.ts` (years, hrefs, stacks, mappings).
 */

export type SiteFrontmatter = {
	locale: string;
	/** Header tagline, e.g. "Technical lead · Berlin". */
	role: string;
	/** Italic line under the h1. */
	subtitle: string;
	/** Sidebar location note, first line. */
	location: string;
	/** Sidebar location note, second line. */
	before: string;
};

export const FRONTMATTER_KEYS = [
	"locale",
	"role",
	"subtitle",
	"location",
	"before",
] as const satisfies readonly (keyof SiteFrontmatter)[];

/** `::project{#id title= meta= link=}` — blurb paragraph, then detail prose. */
export type ProjectAttrs = {
	id: string;
	title: string;
	meta: string;
	/** The expanded row's link label, e.g. "Read the paper ↗". */
	link: string;
};

/** `::topic{#id label=}` — body is the one-paragraph gloss. */
export type TopicAttrs = { id: string; label: string };

/** `::person{#id name= subject=}` — body is the note. */
export type PersonAttrs = { id: string; name: string; subject: string };

/**
 * What the build-time validator checks, per component tag. Anything outside
 * `required` and `optional` is rejected, so a misspelled attribute fails the
 * build rather than rendering as blank.
 */
export const SPEC = {
	project: { required: ["id", "title", "meta", "link"], optional: [] },
	topic: { required: ["id", "label"], optional: [] },
	person: { required: ["id", "name", "subject"], optional: [] },
} as const satisfies Record<
	string,
	{ required: readonly string[]; optional: readonly string[] }
>;
