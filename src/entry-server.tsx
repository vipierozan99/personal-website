import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { cvModel } from "./build/cv-data";
import { renderJsonLd } from "./build/jsonld";
import { renderLlms } from "./build/llms";
import { renderSitemap } from "./build/sitemap";
import { IDENTITY } from "./content/identity";
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

/**
 * The page's structured data — one Person block, derived from the CV, shared
 * by both routes. Injected at the `<!--ld+json-->` marker by prerender.js.
 */
export async function jsonLd(): Promise<string> {
	return renderJsonLd(cvModel(await cvContent.load(DEFAULT_LOCALE)), IDENTITY);
}

/**
 * The machine-readable files written next to the prerendered pages, keyed by
 * output filename. Nothing here touches the filesystem — `scripts/prerender.js`
 * owns the I/O.
 */
export async function artifacts(): Promise<Record<string, string>> {
	const now = new Date(__BUILD_TIME__);
	const [cv, site] = await Promise.all([
		cvContent.load(DEFAULT_LOCALE),
		siteContent.load(DEFAULT_LOCALE),
	]);
	return {
		"llms.txt": renderLlms(cvModel(cv), site, cvContent.LOCALES, now),
		"sitemap.xml": renderSitemap(siteContent.LOCALES, cvContent.LOCALES),
	};
}
