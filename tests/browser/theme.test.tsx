import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../../src/index.css";
import { Sheet, SheetFlow } from "../../src/components/cv/Sheet";

/**
 * A custom property resolves the var() references in its value at the element
 * it is DECLARED on, then inherits the result. So a token derived from --ink or
 * --paper and declared only on :root carries the page theme into the CV sheets,
 * however firmly .sheet-light pins its bases — the sheets go dark on a dark page
 * and the PDF follows. index.css argues this in prose; here it fails a run.
 *
 * Asserted against resolved values rather than the source text, so it holds for
 * any way a token could leak, not just the one shape a parser would look for.
 */
let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
	host = document.createElement("div");
	document.body.append(host);
	root = createRoot(host);
	act(() =>
		root.render(
			<Sheet>
				<SheetFlow>
					<p>paper</p>
				</SheetFlow>
			</Sheet>,
		),
	);
});

afterEach(() => {
	act(() => root.unmount());
	host.remove();
	delete document.documentElement.dataset.theme;
});

const sheet = () => host.firstElementChild as HTMLElement;

/**
 * Every custom property visible on the element, with its resolved value. Read
 * from the computed style rather than the stylesheet: Lightning CSS reshapes
 * the authored rules, but the cascade's answer at the element is exactly what
 * a reader gets, and it discovers new tokens without being told about them.
 */
const tokensOn = (el: HTMLElement) => {
	const computed = getComputedStyle(el);
	const values: Record<string, string> = {};
	for (const name of computed) {
		if (name.startsWith("--")) {
			values[name] = computed.getPropertyValue(name).trim();
		}
	}
	return values;
};

describe("the sheet scope", () => {
	it("carries enough tokens to be worth checking", () => {
		// Guards the reader itself: a silent zero would pass everything below.
		expect(Object.keys(tokensOn(sheet())).length).toBeGreaterThan(10);
	});

	it("resolves every token identically in both page themes", () => {
		document.documentElement.dataset.theme = "light";
		const light = tokensOn(sheet());

		document.documentElement.dataset.theme = "dark";
		expect(tokensOn(sheet())).toEqual(light);
	});

	it("keeps the paper light on a dark page", () => {
		document.documentElement.dataset.theme = "dark";
		const paper = getComputedStyle(sheet()).backgroundColor;

		document.documentElement.dataset.theme = "light";
		expect(getComputedStyle(sheet()).backgroundColor).toBe(paper);
	});
});
