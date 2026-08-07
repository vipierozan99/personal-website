/**
 * A 21cm sheet at the CSS 96dpi reference, plus the desk's 16px gutter each
 * side and 2px of slack — without it sub-pixel rounding of the centred sheet
 * leaves the page a pixel wider than the viewport.
 */
const LAYOUT_WIDTH_PX = Math.ceil(21 * (96 / 2.54) + 2 * 16) + 2;

/**
 * Widens narrow devices' viewport to the sheet so mobile text autosizing
 * never inflates the measured blocks: with the viewport matching the layout,
 * the browser scales the whole page down instead, and `--page-scale` carries
 * the inverse so the chrome around the sheets can size itself back up.
 *
 * The same logic is injected as an inline script into dist/cv/index.html by
 * scripts/prerender.js so direct loads are sized before first paint — this
 * copy exists for SPA navigation onto and off the route. Returns the cleanup
 * that restores the normal responsive viewport.
 */
export function applySheetViewport(): () => void {
	const meta = document.querySelector('meta[name="viewport"]');
	const root = document.documentElement;
	if (!meta) return () => {};

	const orientation = window.matchMedia("(orientation: portrait)");

	const apply = () => {
		// screen, not innerWidth: once the viewport is widened below,
		// innerWidth reports that width on every device.
		const screen = window.screen;
		const device = orientation.matches
			? Math.min(screen.width, screen.height)
			: Math.max(screen.width, screen.height);

		if (device >= LAYOUT_WIDTH_PX) {
			meta.setAttribute("content", "width=device-width, initial-scale=1.0");
			root.style.removeProperty("--page-scale");
			return;
		}
		meta.setAttribute("content", `width=${LAYOUT_WIDTH_PX}`);
		root.style.setProperty("--page-scale", String(LAYOUT_WIDTH_PX / device));
	};

	apply();
	orientation.addEventListener("change", apply);

	return () => {
		orientation.removeEventListener("change", apply);
		meta.setAttribute("content", "width=device-width, initial-scale=1.0");
		root.style.removeProperty("--page-scale");
	};
}
