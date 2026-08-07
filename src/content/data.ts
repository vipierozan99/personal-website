/**
 * Locale-invariant facts. Prose for each id lives in `site.<locale>.md`; the
 * `model.ts` zipper joins the two by id and throws on drift, and the Vite
 * plugin keeps the `.md` files structurally identical across locales.
 */

export type ProjectFacts = {
	id: string;
	year: number;
	href: string;
	stack: readonly string[];
};

export const PROJECTS = [
	{
		id: "vox",
		year: 2024,
		href: "https://noah-labs.com",
		stack: ["Python", "Kafka", "Postgres", "Signal processing"],
	},
	{
		id: "cv",
		year: 2025,
		href: "/cv",
		stack: ["React", "Tailwind", "Print CSS"],
	},
	{
		id: "site",
		year: 2026,
		href: "https://gitlab.com/vipierozan99",
		stack: ["React", "Vite", "Tailwind"],
	},
	{
		id: "knock",
		year: 2022,
		href: "https://ieeexplore.ieee.org/document/9965059",
		stack: ["Python", "Signal processing", "Embedded"],
	},
] as const satisfies readonly ProjectFacts[];

export type ProjectId = (typeof PROJECTS)[number]["id"];

export type TopicFacts = {
	id: string;
	/** Projects this topic lights up when hovered, and vice versa. */
	projects: readonly ProjectId[];
};

export const TOPICS = [
	{ id: "delivery-guarantees", projects: ["vox"] },
	{ id: "consistency", projects: ["vox"] },
	{ id: "local-first", projects: ["cv"] },
	{ id: "event-driven", projects: ["vox"] },
	{ id: "zero-downtime", projects: ["vox"] },
	{ id: "reliability", projects: ["vox", "site"] },
	{ id: "type-systems", projects: [] },
	{ id: "ergonomics", projects: ["cv", "site"] },
	{ id: "perf-abstractions", projects: ["site"] },
	{ id: "cpu-cache", projects: ["knock"] },
	{ id: "columnar", projects: [] },
	{ id: "complexity", projects: ["knock"] },
	{ id: "agent-evals", projects: ["vox"] },
	{ id: "agent-context", projects: [] },
	{ id: "codesign", projects: ["knock"] },
] as const satisfies readonly TopicFacts[];

export type TopicId = (typeof TOPICS)[number]["id"];

export type PersonLink = { label: string; href: string };

export type PersonFacts = {
	id: string;
	links: readonly PersonLink[];
};

// Placeholders until the real list arrives; the link labels move into the
// markdown if they turn out to need translation.
export const PEOPLE = [
	{
		id: "one",
		links: [
			{ label: "site ↗", href: "#" },
			{ label: "the post ↗", href: "#" },
		],
	},
	{ id: "two", links: [{ label: "site ↗", href: "#" }] },
	{
		id: "three",
		links: [
			{ label: "site ↗", href: "#" },
			{ label: "talk ↗", href: "#" },
		],
	},
	{ id: "four", links: [{ label: "site ↗", href: "#" }] },
] as const satisfies readonly PersonFacts[];

export type PersonId = (typeof PEOPLE)[number]["id"];
