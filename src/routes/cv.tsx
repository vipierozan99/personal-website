import { createFileRoute } from "@tanstack/react-router";
import { cvContent, DEFAULT_LOCALE } from "../content/load";

// The component lives in cv.lazy.tsx so the paginator, sheets and CV blocks
// stay out of the home bundle; search validation is inherited from __root.
export const Route = createFileRoute("/cv")({
	loaderDeps: ({ search }) => ({ lang: search.lang ?? DEFAULT_LOCALE }),

	/**
	 * Warms the document so the route commits with sheets rather than with
	 * cv.lazy's placeholder — otherwise navigation cross-fades twice, once to
	 * an empty sheet and again when the chunk lands.
	 *
	 * The guard restates `useCvDocument`'s initial state (cv.lazy.tsx): what
	 * that will render with is what the route may commit on, so blocking past
	 * it would cost the language switch its overlay, and would put German
	 * markup where the prerender wrote English. Keep the two in step.
	 *
	 * Returns nothing on purpose. A loader with data would need dehydrating,
	 * and main.tsx hydrates with a hand-set `router.ssr` precisely because
	 * there is no such state to carry.
	 *
	 * Never pair this with a `pendingComponent`: that same `router.ssr` leaves
	 * the app without a root Suspense, and a pending match would throw its
	 * promise at no boundary.
	 */
	loader: ({ deps }) => {
		if (cvContent.cached(deps.lang) ?? cvContent.cached(DEFAULT_LOCALE)) return;
		// Failure is the component's to report, with its overlay; throwing here
		// would replace the page with nothing.
		return cvContent.load(deps.lang).catch(() => {});
	},
});
