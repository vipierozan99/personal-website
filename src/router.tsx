import { createRouter, type RouterHistory } from "@tanstack/react-router";
import type { i18n as I18n } from "i18next";
import { routeTree } from "./routeTree.gen";

/** One constructor for both entries: browser history in the client (the
 * default), memory history in the prerender. */
export function createAppRouter(i18n: I18n, history?: RouterHistory) {
	return createRouter({
		routeTree,
		history,
		context: { i18n },
		// Warms the CV chunk and its document on hover, so the cross-fade below
		// opens on the click rather than after the network.
		defaultPreload: "intent",
		// Route changes cross-fade like every other swap on the site — see
		// lib/transitions.ts and the ::view-transition rules in index.css, which
		// already put both under `--anim`. Set here rather than per-<Link> so
		// back/forward transitions too: popstate never reaches commitLocation,
		// where a per-link opt-in would be recorded.
		// Suppressed in main.tsx for the boot load and in LangSwitch for the
		// language switch — neither changes the page, and both own a swap already.
		defaultViewTransition: true,
	});
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createAppRouter>;
	}
}
