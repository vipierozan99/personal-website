import { createRouter, type RouterHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/** One constructor for both entries: browser history in the client (the
 * default), memory history in the prerender. */
export function createAppRouter(history?: RouterHistory) {
	return createRouter({
		routeTree,
		history,
		defaultPreload: false,
	});
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createAppRouter>;
	}
}
