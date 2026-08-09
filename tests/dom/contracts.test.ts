import { beforeAll, describe, expect, it } from "vitest";
// `?raw` rather than node:fs — the app tsconfig carries no Node types.
import template from "../../index.html?raw";
import { render } from "../../src/entry-server";

/**
 * scripts/paginate.js and scripts/pdf.js find their way around the CV by CSS
 * class string — `[class*="21cm"]`, `.break-inside-avoid`, `main[lang]` — and
 * scripts/browser.js drives the language menu by ARIA attribute. None of that
 * is typed, imported, or otherwise visible to the compiler: renaming a Tailwind
 * class in a component silently corrupts the committed pagination and the
 * shipped PDFs. These assert the contract from the markup side.
 *
 * The off-screen measuring rig is deliberately absent here — it only mounts
 * during the client's measuring pass, so it is checked in the browser tier.
 */
const parse = (html: string) => {
	const host = document.createElement("div");
	host.innerHTML = html;
	return host;
};

let home: HTMLElement;
let cv: HTMLElement;

beforeAll(async () => {
	[home, cv] = (await Promise.all([render("/"), render("/cv")])).map(parse);
});

describe("selector contracts the build scripts depend on", () => {
	it("renders sheets that paginate.js can find", () => {
		expect(cv.querySelectorAll('[class*="21cm"]').length).toBeGreaterThan(0);
	});

	it("gives every sheet a flow element as its first child", () => {
		// paginate.js measures sheet.firstElementChild, not the sheet itself.
		for (const sheet of cv.querySelectorAll('[class*="21cm"]')) {
			expect(sheet.firstElementChild).not.toBeNull();
		}
	});

	it("marks every CV block as unbreakable", () => {
		expect(cv.querySelectorAll(".break-inside-avoid").length).toBeGreaterThan(
			0,
		);
	});

	it("carries the document language on main", () => {
		const main = cv.querySelector("main[lang]");
		expect(main).not.toBeNull();
		expect(main?.getAttribute("lang")).toBeTruthy();
	});

	it("exposes the language menu through the header", () => {
		// browser.js clicks header button[aria-expanded], then header button[lang].
		expect(home.querySelector("header button[aria-expanded]")).not.toBeNull();
	});
});

/**
 * Asserted on the markup rather than by printing: whether `print:hidden`
 * resolves to display:none is Tailwind's business, but whether the chrome still
 * carries it is ours, and dropping it is what puts the site header on page one
 * of the PDF. The PDF itself stays prepress's job — pdf.js normalises it and
 * the pre-push hook diffs the bytes.
 */
describe("what must not reach the paper", () => {
	const hidesOnPrint = (el: Element | null) =>
		el?.getAttribute("class")?.includes("print:hidden") ?? false;

	it("keeps the site header off the printed CV", () => {
		expect(hidesOnPrint(cv.querySelector("header"))).toBe(true);
	});

	it("keeps the sheets themselves printable", () => {
		for (const sheet of cv.querySelectorAll('[class*="21cm"]')) {
			expect(hidesOnPrint(sheet)).toBe(false);
		}
	});
});

describe("prerender markers", () => {
	it("keeps the JSON-LD injection point", () => {
		expect(template).toContain("<!--ld+json-->");
	});

	it("keeps the mount point prerender.js writes into", () => {
		expect(template).toContain('id="root"');
	});
});

describe("document structure", () => {
	const headingLevels = (root: HTMLElement) =>
		[...root.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((el) =>
			Number(el.tagName[1]),
		);

	it("gives each page exactly one h1", () => {
		expect(home.querySelectorAll("h1")).toHaveLength(1);
		expect(cv.querySelectorAll("h1")).toHaveLength(1);
	});

	it("never skips a heading level on the CV", () => {
		const levels = headingLevels(cv);
		expect(levels[0]).toBe(1);
		for (const [i, level] of levels.entries()) {
			if (i > 0)
				expect(level - Math.max(...levels.slice(0, i))).toBeLessThan(2);
		}
	});

	/**
	 * KNOWN BUG — Sidebar.tsx lists `#projects`, but <Projects /> is commented
	 * out at routes/index.tsx:28, so nav item 03 scrolls nowhere.
	 */
	it.fails("resolves every sidebar anchor to a section on the page", () => {
		const targets = [...home.querySelectorAll('a[href^="#"]')].map((a) =>
			(a.getAttribute("href") ?? "").slice(1),
		);
		expect(targets.length).toBeGreaterThan(0);

		const missing = targets.filter((id) => !home.querySelector(`#${id}`));
		expect(missing).toEqual([]);
	});
});
