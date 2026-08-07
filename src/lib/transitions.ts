import { flushSync } from "react-dom";

/**
 * Performs a state swap behind the browser's cross-fade, where there is one.
 * Everywhere else the swap simply happens, which is what it did before.
 *
 * The whole swap has to sit inside the callback, and has to be synchronous:
 * the outgoing frame is captured before the callback runs, so a React update
 * scheduled outside it may already have reached the DOM and been captured as
 * the "before" — a cross-fade from the new content to itself. `flushSync` is
 * what makes React commit inside the window the browser holds open.
 */
export function crossfade(swap: () => void) {
	if (!document.startViewTransition) {
		swap();
		return;
	}
	const transition = document.startViewTransition(() => flushSync(swap));
	// Two overlapping transitions skip the first — e.g. landing on
	// /cv?lang=de, where the site content and the CV document each swap. The
	// swap itself still commits; only the animation is dropped, so the
	// AbortError the skipped transition rejects with is noise, not a failure.
	transition.ready.catch(() => {});
	transition.finished.catch(() => {});
}
