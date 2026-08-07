import { useCallback } from "react";
import { crossfade } from "./transitions";

/**
 * The theme lives entirely in `<html data-theme>` — seeded before first paint
 * by the inline script in index.html, styled by the token system, surfaced in
 * components only through CSS (the `dark:` variant). React renders no
 * theme-dependent markup, so hydration never sees the theme at all.
 */
export function useThemeToggle() {
	return useCallback(() => {
		const root = document.documentElement;
		const next = root.dataset.theme === "dark" ? "light" : "dark";
		crossfade(() => {
			root.dataset.theme = next;
		});
		try {
			localStorage.theme = next;
		} catch {
			// Private mode without storage: the toggle still works for the session.
		}
	}, []);
}
