import { afterEach } from "vitest";

/**
 * happy-dom keeps one document for the whole file, so anything a test appends
 * or sets on the root is still there for the next one. Clearing it here keeps
 * the tests order-independent.
 */
afterEach(() => {
	document.body.replaceChildren();
	document.documentElement.removeAttribute("data-theme");
});
