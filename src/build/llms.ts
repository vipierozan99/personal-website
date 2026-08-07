import { IDENTITY, SITE_URL } from "../content/identity";
import type { SiteContent } from "../content/model";
import type { CvModel } from "./cv-data";
import { isoDay } from "./inline";

/**
 * An index of the site's machine-readable surface, per llmstxt.org: an H1, a
 * blockquote summary, then link lists. Screening increasingly runs through
 * models rather than people, and the rendered pages are the worst possible
 * thing to hand one — the CV's markup exists to measure A4 sheets.
 */
export function renderLlms(
	cv: CvModel,
	site: SiteContent,
	cvLocales: readonly string[],
	now: Date,
): string {
	const url = (path: string) => new URL(path, `${SITE_URL}/`).href;

	const pdfs = cvLocales.map((locale) => {
		const name = new Intl.DisplayNames(["en"], { type: "language" }).of(locale);
		return `- [CV, PDF, ${name}](${url(`cv.${locale}.pdf`)})`;
	});

	return `${[
		`# ${cv.person.name}`,
		quote(cv.summary),
		[
			`${cv.person.tagline}. ${cv.person.citizenship}.`,
			`Contact: ${cv.person.email}. Updated ${isoDay(now)}.`,
		].join("\n"),
		[
			"## Site",
			"",
			`- [Home](${url("")}): who I am, current projects, and the topics I want to be talking about.`,
			`- Projects: ${site.projects.map((project) => project.title).join(" · ")}.`,
			`- Talking about: ${site.topics.map((topic) => topic.label).join(" · ")}.`,
		].join("\n"),
		[
			"## CV",
			"",
			`- [Rendered CV](${url("cv")}): the full CV, laid out as A4 sheets. Carries the same facts as schema.org Person JSON-LD in its head.`,
			...pdfs,
		].join("\n"),
		// llmstxt.org reserves `## Optional` for what a reader short on context
		// may skip.
		["## Optional", "", `- [Source](${IDENTITY.repository})`].join("\n"),
	].join("\n\n")}\n`;
}

/** Wraps the summary as a blockquote at 78 columns, greedily. */
function quote(text: string): string {
	const lines: string[] = [];
	let line = ">";

	for (const word of text.split(" ")) {
		if (line.length + 1 + word.length > 78) {
			lines.push(line);
			line = ">";
		}
		line += ` ${word}`;
	}

	lines.push(line);
	return lines.join("\n");
}
