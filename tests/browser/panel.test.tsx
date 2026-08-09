import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../src/index.css";
import { Panel } from "../../src/components/Panel";
import { type Language, LanguageContext } from "../../src/lib/lang-context";

/**
 * A panel expands by animating its own height, so the text inside keeps its
 * metrics and whatever follows the panel moves with the box. Nothing without a
 * layout engine can see that: happy-dom resolves no height to grow from, and
 * the overflow the button depends on never registers.
 */
const CAP = 460;
const CONTENT = 1200;

const language = {
	lang: "en",
	content: {} as Language["content"],
	t: ((key: string) => key) as unknown as Language["t"],
	pending: false,
	prefetch: () => {},
} satisfies Language;

let host: HTMLDivElement;
let root: Root;

const draw = (height: number) =>
	act(() =>
		root.render(
			<LanguageContext.Provider value={language}>
				<Panel label="projects">
					<div style={{ height: `${height}px` }} />
				</Panel>
			</LanguageContext.Provider>,
		),
	);

beforeEach(async () => {
	// Reduced motion would collapse the animation to an instant swap, which is
	// correct behaviour and the opposite of what this file measures.
	document.documentElement.style.setProperty("--anim", "1");
	host = document.createElement("div");
	document.body.append(host);
	root = createRoot(host);
	draw(CONTENT);
	// The button is a ResizeObserver's answer, not a render's — it settles in.
	await act(async () => {
		await vi.waitFor(() => expect(button()).not.toBeNull());
	});
});

afterEach(() => {
	act(() => root.unmount());
	host.remove();
	document.documentElement.style.removeProperty("--anim");
});

const scroller = () => host.querySelector(".overscroll-contain") as HTMLElement;
const button = () => host.querySelector("button");
const click = () => act(() => (button() as HTMLButtonElement).click());
/** Two frames, because one is not enough: an animation's start time is set on
 *  the frame it first ticks, so it is still at 0% inside that frame's callback. */
const frame = () =>
	act(async () => {
		await new Promise((resolve) =>
			requestAnimationFrame(() => requestAnimationFrame(resolve)),
		);
	});
const settled = (el: HTMLElement) =>
	act(async () => {
		await Promise.all(
			el.getAnimations().map((animation) => animation.finished),
		);
	});
/** Where the run in flight starts and ends. A finished run can linger in
 *  getAnimations() until the browser retires it, so only a running one is
 *  the answer to "what is it doing now". */
const heights = (el: HTMLElement) => {
	const running = el
		.getAnimations()
		.filter((animation) => animation.playState === "running");
	expect(running).toHaveLength(1);
	const effect = running[0].effect as KeyframeEffect;
	return effect.getKeyframes().map((frame) => frame.height as string);
};

describe("a capped panel", () => {
	it("caps itself until it is expanded", () => {
		expect(scroller().clientHeight).toBe(CAP);
		click();
		expect(scroller().scrollHeight).toBe(CONTENT);
	});

	it("grows from the cap to the full height, not from zero", async () => {
		const el = scroller();
		click();
		expect(heights(el)).toEqual([`${CAP}px`, `${CONTENT}px`]);
		await settled(el);
		expect(el.getBoundingClientRect().height).toBe(CONTENT);
	});

	it("shrinks back to the cap", async () => {
		const el = scroller();
		click();
		await settled(el);
		click();
		expect(heights(el)).toEqual([`${CONTENT}px`, `${CAP}px`]);
		await settled(el);
		expect(el.getBoundingClientRect().height).toBe(CAP);
	});

	it("clips while it moves and scrolls again once it lands", async () => {
		const el = scroller();
		click();
		await settled(el);
		click();
		expect(getComputedStyle(el).overflowY).toBe("hidden");
		await settled(el);
		await act(async () => {
			await vi.waitFor(() =>
				expect(getComputedStyle(el).overflowY).toBe("auto"),
			);
		});
	});

	it("keeps the button up throughout, and through a collapse", async () => {
		const el = scroller();
		click();
		await settled(el);
		// Expanding does not make the list short enough to fit.
		expect(button()).not.toBeNull();
		click();
		expect(button()).not.toBeNull();
		await settled(el);
		expect(button()).not.toBeNull();
	});

	it("drops the button once the whole list fits the cap", async () => {
		const el = scroller();
		click();
		await settled(el);
		draw(CAP - 100);
		await frame();
		expect(button()).toBeNull();
	});

	it("reserves the scrollbar's space in every state", async () => {
		const el = scroller();
		expect(getComputedStyle(el).scrollbarGutter).toBe("stable");
		const capped = el.clientWidth;
		click();
		await settled(el);
		// The text's measure is the same expanded as capped: a scrollbar that
		// comes and goes must not reflow the lines beside it.
		expect(el.clientWidth).toBe(capped);
	});

	it("fades the gradient rather than mounting it", async () => {
		const el = scroller();
		const gradient = host.querySelector(".pointer-events-none") as HTMLElement;
		// A CSS transition is an animation too, so the same wait settles it.
		await settled(gradient);
		expect(getComputedStyle(gradient).opacity).toBe("1");
		click();
		await settled(el);
		await settled(gradient);
		// Still there, just invisible — mounting it is what made the collapse
		// snap a gradient into place over content that had not moved yet.
		expect(gradient.isConnected).toBe(true);
		expect(getComputedStyle(gradient).opacity).toBe("0");
	});

	it("retargets a toggle that interrupts a running one", async () => {
		const el = scroller();
		click();
		await frame();
		click();
		// The reversal starts from the live height, not from the cap the first
		// run started at — otherwise it would jump before it moved.
		const [from, to] = heights(el);
		expect(Number.parseFloat(from)).toBeGreaterThan(CAP);
		expect(Number.parseFloat(from)).toBeLessThan(CONTENT);
		expect(to).toBe(`${CAP}px`);
		await settled(el);
		expect(el.getBoundingClientRect().height).toBe(CAP);
	});
});
