/** A 21cm sheet at the CSS 96dpi reference, and the desk's 1rem gutter each side. */
const SHEET_PX = 21 * (96 / 2.54);
const GUTTER_PX = 2 * 16;

/**
 * Scales the sheet stack down to the width of the device, as `--cv-fit`.
 *
 * Measured against `screen` rather than the viewport, and in script rather
 * than in CSS, because a viewport-relative factor feeds back on iOS: an
 * overflowing sheet makes WebKit widen the layout viewport to the content, a
 * wider viewport computes a fit near 1, that fit narrows the content again,
 * and the page oscillates under a pinch. The screen cannot be changed by
 * anything the page lays out, so the factor has no way to chase itself.
 *
 * The same computation is injected as an inline script into dist/cv/index.html
 * by scripts/prerender.js so direct loads are sized before first paint — this
 * copy exists for SPA navigation onto and off the route. Returns the cleanup
 * that hands the rest of the site back its unscaled sheets.
 */
export function applySheetFit(): () => void {
	const root = document.documentElement;
	const orientation = window.matchMedia("(orientation: portrait)");

	const apply = () => {
		const screen = window.screen;
		const device = orientation.matches
			? Math.min(screen.width, screen.height)
			: Math.max(screen.width, screen.height);
		root.style.setProperty(
			"--cv-fit",
			String(Math.min(1, (device - GUTTER_PX) / SHEET_PX)),
		);
	};

	apply();
	orientation.addEventListener("change", apply);

	return () => {
		orientation.removeEventListener("change", apply);
		root.style.removeProperty("--cv-fit");
	};
}
