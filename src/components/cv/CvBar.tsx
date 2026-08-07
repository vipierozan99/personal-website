import { useT } from "../../lib/lang";

/**
 * The slim strip of CV-specific actions between the site header and the
 * sheets. The PDF link follows the language actually rendered — a PT visitor
 * reads the English document and gets the English PDF.
 */
export function CvBar({ documentLocale }: { documentLocale: string }) {
	const t = useT();

	return (
		<div className="flex items-center justify-end print:hidden">
			<a
				href={`/cv.${documentLocale}.pdf`}
				download
				hrefLang={documentLocale}
				aria-label={t("cv.downloadPdf")}
				className="cursor-pointer rounded-full border border-accent-line px-3 py-1 font-mono text-accent text-tag uppercase tracking-widest transition-colors duration-150 hover:border-accent hover:no-underline"
			>
				↓ {t("cv.pdf")}
			</a>
		</div>
	);
}
