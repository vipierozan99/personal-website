import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { cvContent, DEFAULT_LOCALE, siteContent } from "./content/load";
import { createI18n } from "./i18n";
import { createAppRouter } from "./router";

/**
 * Renders one route to markup for `scripts/prerender.js`. No route has a
 * loader, so there is nothing to dehydrate — the client re-creates identical
 * state from the same inputs and hydrates over this output. The prerendered
 * page is always the default locale; `?lang=` is applied client-side after
 * hydration, so the search param plays no part here.
 */
export async function render(pathname: string) {
	const warm: Promise<unknown>[] = [siteContent.load(DEFAULT_LOCALE)];
	if (pathname.startsWith("/cv")) warm.push(cvContent.load(DEFAULT_LOCALE));
	const [i18n] = await Promise.all([createI18n(DEFAULT_LOCALE), ...warm]);
	const router = createAppRouter(
		i18n,
		createMemoryHistory({ initialEntries: [pathname] }),
	);
	await router.load();
	return renderToString(
		<StrictMode>
			<RouterProvider router={router} />
		</StrictMode>,
	);
}
