import { createMarkdownParser } from "comark";
import { describe, expect, it } from "vitest";
import { PEOPLE, PROJECTS, TOPICS } from "./data";
import { buildContent, type SiteDocument } from "./model";
// `?raw` bypasses the comark plugin, so the test drives the parser itself and
// can also parse mutated copies of the source.
import source from "./site.en.md?raw";

const parse = createMarkdownParser({ linkify: false });

const document = async (markdown: string) =>
	(await parse(markdown)) as SiteDocument;

describe("buildContent", () => {
	it("joins every fact in data.ts to its prose", async () => {
		const content = buildContent(await document(source));

		expect(content.projects.map((project) => project.id)).toEqual(
			PROJECTS.map((facts) => facts.id),
		);
		expect(content.topics).toHaveLength(TOPICS.length);
		expect(content.people).toHaveLength(PEOPLE.length);

		for (const project of content.projects) {
			expect(project.title).toBeTruthy();
			expect(project.blurb.nodes).toHaveLength(1);
			expect(project.detail.nodes.length).toBeGreaterThan(0);
		}
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

	it("throws when the markdown is missing an id data.ts expects", async () => {
		const gutted = source.replace(/::project\{#vox[^}]*\}/, "::project{#nope}");
		await expect(async () =>
			buildContent(await document(gutted)),
		).rejects.toThrow(/no ::project\{#vox\}/);
	});

	it("throws when the markdown has an id data.ts does not know", async () => {
		const extra = `${source}\n::topic{#rogue label="Rogue"}\nGloss.\n::\n`;
		await expect(async () =>
			buildContent(await document(extra)),
		).rejects.toThrow(/topic#rogue/);
	});
});
