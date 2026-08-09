import { z } from "zod";

/**
 * The contract between `site.*.md` and the components that render it,
 * enforced by the Vite plugin at build time — a missing or misspelled
 * attribute fails the build rather than rendering as blank (`strictObject`
 * is what rejects the misspellings). `invariant` names the attributes that
 * must be byte-identical in every locale, so a fact (a year, an href, a
 * stack) corrected in one language cannot silently stay stale in another.
 *
 * Build-time only: everything here is imported by `vite/comark.ts`, and only
 * *types* flow into `model.ts` — zod never enters the client bundle.
 */

export const frontmatterSchema = z.strictObject({
	locale: z.string().min(1),
	/** Header tagline, e.g. "Technical lead · Berlin". */
	role: z.string().min(1),
	/** Italic line under the h1. */
	subtitle: z.string().min(1),
	/** Sidebar location note, first line. */
	location: z.string().min(1),
	/** Sidebar location note, second line. */
	before: z.string().min(1),
	person: z.strictObject({
		name: z.string().min(1),
		email: z.string().email(),
		github: z.strictObject({ label: z.string().min(1), href: z.url() }),
		paper: z.url(),
	}),
});

export type SiteFrontmatter = z.infer<typeof frontmatterSchema>;

/**
 * `::project{#id title= meta= link= year= href= stack=}` — first paragraph is
 * the collapsed row's blurb, the rest is the expanded detail. `stack` is
 * "·"-separated chips.
 */
const projectSchema = z.strictObject({
	id: z.string().min(1),
	title: z.string().min(1),
	meta: z.string().min(1),
	/** The expanded row's link label, e.g. "Read the paper ↗". */
	link: z.string().min(1),
	// Attribute values arrive as strings; coerce rather than reject "2024".
	year: z.coerce.number().int(),
	href: z.string().min(1),
	stack: z.string().min(1),
});

/**
 * `::topic{#id label= projects=}` — body is the one-paragraph gloss.
 * `projects` names the ::project ids this topic cross-lights, "·"-separated.
 */
const topicSchema = z.strictObject({
	id: z.string().min(1),
	label: z.string().min(1),
	projects: z.string().optional(),
});

/**
 * `::person{#id name= subject=}` — body is the note; a final paragraph made
 * only of links becomes the card's link list.
 */
const personSchema = z.strictObject({
	id: z.string().min(1),
	name: z.string().min(1),
	subject: z.string().min(1),
});

export type ProjectAttrs = z.infer<typeof projectSchema>;
export type TopicAttrs = z.infer<typeof topicSchema>;
export type PersonAttrs = z.infer<typeof personSchema>;

export const SPEC = {
	project: { attrs: projectSchema, invariant: ["year", "href", "stack"] },
	topic: { attrs: topicSchema, invariant: ["projects"] },
	person: { attrs: personSchema, invariant: [] },
} as const satisfies Record<
	string,
	{ attrs: z.ZodType; invariant: readonly string[] }
>;
