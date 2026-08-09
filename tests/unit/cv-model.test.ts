import { createMarkdownParser } from "comark";
import { describe, expect, it } from "vitest";
import {
	attrsOf,
	type CvDocument,
	dissect,
	textOf,
} from "../../src/content/cv-model";
// `?raw` bypasses the comark plugin, so the test drives the parser itself.
import source from "../../src/content/en/cv.md?raw";

const parse = createMarkdownParser({ linkify: false });

const document = async () => (await parse(source)) as CvDocument;

describe("cv dissect", () => {
	it("splits the preamble from the h2 sections", async () => {
		const { preamble, sections } = dissect(await document());

		// The summary is the only thing before the first heading.
		expect(preamble.map((node) => node[0])).toEqual(["summary"]);

		const labels = sections.map((section) => section.label);
		expect(labels[0]).toBe("Experience");
		expect(labels[1]).toBe("Education");
		expect(sections).toHaveLength(6);
	});

	it("marks the {.closing} sections", async () => {
		const { sections } = dissect(await document());
		expect(sections.map((section) => section.closing)).toEqual([
			false,
			false,
			true,
			true,
			true,
			true,
		]);
	});

	it("resolves the bare `break` attribute through the renderer's path", async () => {
		const doc = await document();
		const { sections } = dissect(doc);
		const education = sections.find((section) => section.label === "Education");
		const academia = education?.nodes.find((node) => node[0] === "academia");
		expect(academia).toBeDefined();
		const attrs = attrsOf<{ break?: boolean; org: string }>(
			academia as NonNullable<typeof academia>,
			doc,
		);
		expect(attrs.break).toBe(true);
		expect(attrs.org).toContain("UFSC");
	});

	it("reads heading text for section labels", async () => {
		const { sections } = dissect(await document());
		for (const section of sections) {
			expect(textOf(["h2", {}, section.label])).toBe(section.label);
		}
	});
});
