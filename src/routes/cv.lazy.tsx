import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AutoPaginate } from "../components/cv/AutoPaginate";
import { buildBlocks } from "../components/cv/blocks-builder";
import { Colophon } from "../components/cv/Colophon";
import { CvHeader } from "../components/cv/CvHeader";
import { CvContext, type CvRenderContext } from "../components/cv/context";
import { applySheetFit } from "../components/cv/fit";
import { LoadingOverlay } from "../components/cv/LoadingOverlay";
import { PdfLink } from "../components/cv/PdfLink";
import { PAGINATION } from "../components/cv/pagination.generated";
import { Sheet, SheetFooter } from "../components/cv/Sheet";
import { Header } from "../components/Header";
import type { CvDocument } from "../content/cv-model";
import { cvContent } from "../content/load";
import { useLanguage } from "../lib/lang-context";
import { crossfade } from "../lib/transitions";
import { useNow } from "../lib/useNow";

export const Route = createLazyFileRoute("/cv")({
	component: CvPage,
});

function CvPage() {
	const { lang, t } = useLanguage();
	const { doc, pending } = useCvDocument(lang);
	const now = useNow();
	const render = useMemo<CvRenderContext>(() => ({ t, now }), [t, now]);

	const blocks = useMemo(() => (doc ? buildBlocks(doc) : []), [doc]);

	// Sized on mount for SPA navigation; direct loads were already sized by
	// the inline script prerender.js injects. Cleanup hands the rest of the
	// site back its unscaled sheets.
	// Layout, not passive: a route change resolves its view transition from a
	// layout effect, which runs before passive ones, so a passive fit could be
	// applied after the snapshot — photographing unscaled 21cm sheets on a
	// phone and then shrinking them.
	useLayoutEffect(() => applySheetFit(), []);

	return (
		<CvContext.Provider value={render}>
			{/* The PDF follows the document, not the selection, and falls back to
			    English for the moment before the chunk lands — the same document
			    the placeholder below stands in for. */}
			<Header
				actions={<PdfLink documentLocale={doc?.frontmatter.locale ?? "en"} />}
			/>
			{/* leading-[normal] resets the desk's inherited line-height so every
			    measured block height matches the committed pagination capture. */}
			<main
				className="flex min-h-dvh flex-col gap-4 bg-band p-4 leading-[normal] print:gap-0 print:bg-transparent print:p-0"
				lang={doc?.frontmatter.locale}
			>
				{doc ? (
					<>
						<AutoPaginate
							// Keyed on the document's own language rather than on the
							// selection: the two part company while a chunk is in flight,
							// and seeding one language's breaks into the other's blocks is
							// the flash of wrong pagination this prevents.
							key={doc.frontmatter.locale}
							blocks={blocks}
							captured={PAGINATION[doc.frontmatter.locale]}
							continuedLabel={t("cv.continued")}
							header={<CvHeader person={doc.frontmatter.person} />}
							footer={(page, total) => (
								<SheetFooter
									name={t("cv.footer", { name: doc.frontmatter.person.name })}
									site={doc.frontmatter.person.site}
									page={page}
									total={total}
								/>
							)}
						/>
						<Colophon />
					</>
				) : (
					// SPA navigation lands here before the code-split document chunk
					// arrives; direct loads never do (the entries warm the cache).
					<div className="fit-sheets">
						<Sheet fit="content" className="min-h-[40vh]" />
					</div>
				)}
				{pending ? <LoadingOverlay label={t("cv.loading")} /> : null}
			</main>
		</CvContext.Provider>
	);
}

/**
 * The CV document that trails the selected language, mirroring the site
 * content's swap machinery: a cached switch happens inside one cross-fade,
 * an uncached one shows the overlay while the chunk loads, and chunks that
 * land out of order are discarded (`wanted`). PT has no CV — the loader
 * serves the English document, so the PDF link and `lang` attribute follow
 * `doc.frontmatter.locale`, not the selection.
 */
function useCvDocument(lang: string) {
	const [doc, setDoc] = useState<CvDocument | null>(
		() => cvContent.cached(lang) ?? cvContent.cached("en") ?? null,
	);
	const [pending, setPending] = useState(doc === null);
	const wanted = useRef<string | null>(null);

	// `doc` is deliberately not a dependency: the effect answers the
	// selection, not its own writes.
	// biome-ignore lint/correctness/useExhaustiveDependencies: see above
	useEffect(() => {
		wanted.current = lang;

		const swap = (loaded: CvDocument) =>
			crossfade(() => {
				setDoc(loaded);
				setPending(false);
			});

		const cached = cvContent.cached(lang);
		if (cached) {
			if (cached !== doc) swap(cached);
			else setPending(false);
			return;
		}

		setPending(true);
		cvContent
			.load(lang)
			.then((loaded) => {
				if (wanted.current === lang) swap(loaded);
			})
			.catch(() => {
				if (wanted.current === lang) setPending(false);
			});
	}, [lang]);

	return { doc, pending };
}
