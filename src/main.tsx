import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import { DEFAULT_LOCALE, loadContent } from "./content/load";
import { createI18n } from "./i18n";
import { createAppRouter } from "./router";

const root = document.getElementById("root")!;

// Awaited before the first render rather than suspended on: a fallback would
// be markup the prerender never produced. The content chunk is preloaded next
// to the app bundle, so there is no round trip to hide behind one anyway.
Promise.all([loadContent(DEFAULT_LOCALE), createI18n(DEFAULT_LOCALE)]).then(
	async ([, i18n]) => {
		const router = createAppRouter(i18n);

		// The prerender uses renderToString, where the router takes its server
		// branch and renders a SafeFragment where the browser branch renders a
		// root Suspense (Matches.tsx checks `router.ssr` to know it is hydrating
		// server markup). The official `hydrate()` sets this from a dehydration
		// payload; with no loaders there is no state to carry, so only the flag
		// itself is needed. Without it every hydration fails with React #418 and
		// the page re-renders from scratch.
		(router as { ssr?: unknown }).ssr = {};

		await router.load();

		const tree = (
			<StrictMode>
				<RouterProvider router={router} />
			</StrictMode>
		);

		// `vite build` prerenders into the mount point, but the dev server serves
		// the bare template — hydrating that would report a mismatch against
		// markup that was simply never there.
		if (root.hasChildNodes()) {
			hydrateRoot(root, tree);
		} else {
			createRoot(root).render(tree);
		}
	},
);
