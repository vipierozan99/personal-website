import { z } from "zod";

/**
 * The contract between `cv.md` and the components that render it, enforced by
 * the Vite plugin at build time like `schema.ts` is for `site.md`. Build-time
 * only — components import the inferred types.
 */

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const month = z.string().regex(MONTH, "must be YYYY-MM");

export const cvFrontmatterSchema = z.strictObject({
	locale: z.string().min(1),
	person: z.strictObject({
		name: z.string().min(1),
		tagline: z.string().min(1),
		email: z.string().email(),
		citizenship: z.string().min(1),
		site: z.string().min(1),
		links: z.array(z.strictObject({ label: z.string(), href: z.url() })),
	}),
});

export type CvFrontmatter = z.infer<typeof cvFrontmatterSchema>;

/** `::role{#id org= from= [to=] [break]}` — one job; `### title`, bullets,
 *  and a `#stack` slot in the body. */
const roleSchema = z
	.strictObject({
		id: z.string().min(1),
		org: z.string().min(1),
		from: month,
		to: month.optional(),
		break: z.coerce.boolean().optional(),
	})
	.refine((attrs) => !attrs.to || attrs.to >= attrs.from, {
		message: "to precedes from",
	});

/** `::academia{#id org= from= to= [break]}` — the degree block. */
const academiaSchema = z
	.strictObject({
		id: z.string().min(1),
		org: z.string().min(1),
		from: month,
		to: month,
		break: z.coerce.boolean().optional(),
	})
	.refine((attrs) => attrs.to >= attrs.from, { message: "to precedes from" });

const entrySchema = z.strictObject({ id: z.string().min(1) });

/** `::skills` — items come from the fenced ```yaml [props]``` block. */
const skillsSchema = z.strictObject({
	items: z
		.array(z.strictObject({ key: z.string().min(1), value: z.string().min(1) }))
		.min(1),
});

const summarySchema = z.strictObject({});

export type RoleAttrs = z.infer<typeof roleSchema>;
export type AcademiaAttrs = z.infer<typeof academiaSchema>;
export type SkillsAttrs = z.infer<typeof skillsSchema>;

export const CV_SPEC = {
	summary: { attrs: summarySchema, invariant: [] },
	role: { attrs: roleSchema, invariant: ["org", "from", "to"] },
	academia: { attrs: academiaSchema, invariant: ["org", "from", "to"] },
	entry: { attrs: entrySchema, invariant: [] },
	skills: { attrs: skillsSchema, invariant: [] },
} as const satisfies Record<
	string,
	{ attrs: z.ZodType; invariant: readonly string[] }
>;
