import { writeFileSync } from "node:fs";
import { cvLocales, select, settled, withPage } from "./browser.js";

/**
 * Prints the CV to a PDF per language, so `/cv.<locale>.pdf` is a link that
 * can be handed to a recruiter's upload form without the reader going through
 * the browser's print dialogue and its scaling, margins and header settings.
 *
 * Printed from the built page rather than drawn separately: the sheets are
 * 21cm × 29.7cm objects with an `@page` rule to match, so what Chrome
 * paginates is what the screen already shows, with the print rules the design
 * already carries — chrome hidden, gaps closed, paper lock keeping the sheets
 * light whatever theme the machine prefers.
 *
 * Written into `public/`, not just `dist/`: like the pagination capture, this
 * needs a browser, and the deploy has none. Vite copies it into `dist/` on
 * the next build.
 */
const DIST = "dist";
const OUT = "public";

/**
 * Chrome stamps a timestamp and a document id into every PDF it makes, so the
 * same page printed twice is two different files. Both are overwritten with
 * fixed values: without that the artifacts differ on every run, and the
 * pre-push check that asks whether they are still current could only answer no.
 */
function normalise(pdf) {
	return Buffer.from(
		pdf
			.toString("latin1")
			.replace(
				/\/CreationDate \(D:[^)]*\)/g,
				"/CreationDate (D:19700101000000Z)",
			)
			.replace(/\/ModDate \(D:[^)]*\)/g, "/ModDate (D:19700101000000Z)")
			.replace(/\/ID \[<[^\]]*>\]/g, "/ID [<0> <0>]"),
		"latin1",
	);
}

const locales = cvLocales();

const written = await withPage(DIST, async ({ evaluate, send, goto }) => {
	await goto("/cv");
	// Settling the prerendered locale first also waits out hydration — a click
	// dispatched before the listeners attach selects nothing.
	await evaluate(settled("en"));
	const names = [];

	for (const locale of locales) {
		await evaluate(select(locale));
		const sheets = await evaluate(settled(locale));

		// The root background Chrome paints behind each printed page follows the
		// scroll offset; a page printed after scrolling carries an extra
		// background rect and the PDF stops being byte-reproducible.
		await evaluate(
			"window.scrollTo(0, 0); new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))",
		);

		const { data } = await send("Page.printToPDF", {
			// The sheets set their own size and the document has an `@page` rule
			// that agrees with it; letting Chrome pick instead is how a 21cm sheet
			// ends up spilling onto a second Letter page.
			preferCSSPageSize: true,
			// The hairlines under the section labels are backgrounds rather than
			// borders, so without this they print as nothing at all.
			printBackground: true,
		});

		// The CvBar links follow this naming rule; it cannot be imported into a
		// plain node script, so it is spelled out here. Every copy names its
		// language — `/cv.pdf` is a redirect in public/_redirects, not a file.
		const name = `cv.${locale}.pdf`;
		const pdf = normalise(Buffer.from(data, "base64"));
		writeFileSync(`${OUT}/${name}`, pdf);
		// Also into the build that was just printed, which is otherwise carrying
		// the copies vite took from `public/` before these existed.
		writeFileSync(`${DIST}/${name}`, pdf);
		names.push(
			`${name} (${sheets} sheets, ${Math.round(pdf.length / 1024)}KB)`,
		);
	}

	return names;
});

// info, not log: this is build progress on purpose, not a leftover debug print.
console.info(`printed ${written.join(", ")} into ${OUT}/`);
