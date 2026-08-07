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
		defaultPreload: false,
	});
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createAppRouter>;
	}
}
