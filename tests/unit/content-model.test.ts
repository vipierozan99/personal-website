import { createMarkdownParser } from "comark";
import { describe, expect, it } from "vitest";
// `?raw` bypasses the comark plugin, so the test drives the parser itself and
// can also parse mutated copies of the source.
import source from "../../src/content/en/site.md?raw";
import { buildContent, type SiteDocument } from "../../src/content/model";

const parse = createMarkdownParser({ linkify: false });

const document = async (markdown: string) =>
	(await parse(markdown)) as SiteDocument;

describe("buildContent", () => {
	it("shapes projects, topics and people from the document", async () => {
		const content = buildContent(await document(source));

		expect(content.projects).toHaveLength(4);
		expect(content.topics).toHaveLength(15);
		expect(content.people).toHaveLength(4);

		const vox = content.projects.find((project) => project.id === "vox");
		expect(vox?.year).toBe(2024);
		expect(vox?.stack).toEqual([
			"Python",
			"Kafka",
			"Postgres",
			"Signal processing",
		]);
		expect(vox?.blurb.nodes.length).toBeGreaterThan(0);
		expect(vox?.detail.nodes.length).toBeGreaterThan(0);

		for (const topic of content.topics) {
			expect(topic.label).toBeTruthy();
			expect(topic.gloss.nodes.length).toBeGreaterThan(0);
		}
	});

	it("splits the intro at the pull quote", async () => {
		const { intro } = buildContent(await document(source));
		expect(intro.bio.nodes.length).toBeGreaterThan(0);
		expect(intro.quote.nodes.length).toBeGreaterThan(0);
		expect(intro.lead.nodes.length).toBeGreaterThan(0);
	});

	it("splits a trailing link paragraph out of a person's note", async () => {
		const { people } = buildContent(await document(source));
		expect(people[0].links).toEqual([
			{ label: "site ↗", href: "#" },
			{ label: "the post ↗", href: "#" },
		]);
		expect(people[0].note.nodes.length).toBeGreaterThan(0);
	});

	it("throws when a topic names an unknown project", async () => {
		const mangled = source.replace('projects="vox"', 'projects="nope"');
		await expect(async () =>
			buildContent(await document(mangled)),
		).rejects.toThrow(/unknown project "nope"/);
	});

	/**
	 * KNOWN BUG — model.ts:174 flattens a link's children with join(""), which
	 * stringifies any nested element. Emphasis inside a person's link label
	 * renders as "strong,,site" rather than the words.
	 */
	it.fails("keeps a link label readable when it carries emphasis", async () => {
		const mangled = source.replace("[site ↗](#)", "[**site** ↗](#)");
		const { people } = buildContent(await document(mangled));
		expect(people[0].links[0].label).toBe("site ↗");
	});

	/**
	 * KNOWN BUG — model.ts:98 coerces the year with Number() and never checks
	 * the result, so a typo becomes NaN, flows into the byYear comparator, and
	 * leaves the project list in an unspecified order instead of failing.
	 */
	it.fails("rejects a project year that is not a number", async () => {
		const mangled = source.replace("year=2024", 'year="soon"');
		await expect(async () =>
			buildContent(await document(mangled)),
		).rejects.toThrow();
	});
});
