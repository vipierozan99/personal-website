import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../../src/index.css";
import { Sheet, SheetFlow } from "../../src/components/cv/Sheet";

/**
 * The geometry nothing without a layout engine can see. happy-dom resolves no
 * box, so every invariant here — the paper size the PDF is cut to, and what the
 * --cv-fit transform does and does not scale — is invisible to the other tiers.
 */
const CM = 96 / 2.54;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
	host = document.createElement("div");
	document.body.append(host);
	root = createRoot(host);
});

afterEach(() => {
	act(() => root.unmount());
	host.remove();
	document.documentElement.style.removeProperty("--cv-fit");
});

const draw = (ui: React.ReactNode) => {
	act(() => root.render(ui));
};

const block = (text: string) => (
	<div className="break-inside-avoid" data-block>
		{text}
	</div>
);

describe("sheet geometry", () => {
	it("is exactly A4 so the PDF needs no scaling", () => {
		// @page states A4 with a zero margin; if these drift, printToPDF's
		// preferCSSPageSize silently rescales or clips every sheet.
		draw(
			<Sheet>
				<SheetFlow>{block("one")}</SheetFlow>
			</Sheet>,
		);
		const rect = host.firstElementChild?.getBoundingClientRect();
		expect(rect?.width).toBeCloseTo(21 * CM, 0);
		expect(rect?.height).toBeCloseTo(29.7 * CM, 0);
	});

	it("clips rather than grows when a block overflows the page", () => {
		draw(
			<Sheet>
				<SheetFlow>
					<div style={{ height: "50cm" }} />
				</SheetFlow>
			</Sheet>,
		);
		// packBlocks lets an oversized block overflow; the sheet must still be
		// one page, or the pagination and the paper disagree.
		const rect = host.firstElementChild?.getBoundingClientRect();
		expect(rect?.height).toBeCloseTo(29.7 * CM, 0);
	});
});

describe("the --cv-fit transform", () => {
	const twoSheets = (
		<>
			<div className="fit-sheets flex flex-col gap-4" data-stack>
				<Sheet>
					<SheetFlow>{block("scaled")}</SheetFlow>
				</Sheet>
			</div>
			<div data-rig>
				<Sheet>
					<SheetFlow>{block("unscaled")}</SheetFlow>
				</Sheet>
			</div>
		</>
	);

	it("scales the sheets inside it", () => {
		draw(twoSheets);
		const stack = host.querySelector("[data-stack] > div");
		const full = stack?.getBoundingClientRect().width ?? 0;

		document.documentElement.style.setProperty("--cv-fit", "0.5");
		expect(stack?.getBoundingClientRect().width).toBeCloseTo(full / 2, 0);
	});

	/**
	 * The invariant AutoPaginate's comment is about: the measuring rig sits
	 * outside .fit-sheets so its getBoundingClientRect deltas stay in the same
	 * pixels as the committed capture. Move it inside and every block measures
	 * `fit` times smaller on a phone, so the whole CV packs onto one sheet.
	 */
	it("leaves anything outside it measuring at zoom 1", () => {
		draw(twoSheets);
		const rig = host.querySelector("[data-rig] [data-block]");
		const before = rig?.getBoundingClientRect().height ?? 0;
		expect(before).toBeGreaterThan(0);

		document.documentElement.style.setProperty("--cv-fit", "0.5");
		expect(rig?.getBoundingClientRect().height).toBeCloseTo(before, 5);
	});

	it("takes back the space the transform leaves behind", () => {
		// transform: scale() does not change layout size, so fit-sheets pulls the
		// remainder back with a negative margin. Without it a phone shows a
		// screenful of blank desk under every sheet.
		draw(twoSheets);
		document.documentElement.style.setProperty("--cv-fit", "0.5");

		const stack = host.querySelector("[data-stack]");
		const sheet = host.querySelector("[data-stack] > div");
		const stackHeight = stack?.getBoundingClientRect().height ?? 0;
		const sheetHeight = sheet?.getBoundingClientRect().height ?? 0;

		expect(stackHeight - sheetHeight).toBeLessThan(4);
	});
});
