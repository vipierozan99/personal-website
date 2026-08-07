import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createAppRouter } from "./router";

/**
 * Renders one route to markup for `scripts/prerender.js`. No route has a
 * loader, so there is nothing to dehydrate — the client re-creates identical
 * state from the same inputs and hydrates over this output.
 */
export async function render(pathname: string) {
	const router = createAppRouter(
		createMemoryHistory({ initialEntries: [pathname] }),
	);
	await router.load();
	return renderToString(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	);
}
