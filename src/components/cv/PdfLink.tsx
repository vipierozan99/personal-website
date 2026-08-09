import { useT } from "../../lib/lang";

/**
 * The CV route's header action. The PDF follows the language actually
 * rendered — a PT visitor reads the English document and gets the English PDF.
 */
export function PdfLink({ documentLocale }: { documentLocale: string }) {
	const t = useT();

	return (
		<a
			href={`/cv.${documentLocale}.pdf`}
			download
			hrefLang={documentLocale}
			aria-label={t("cv.downloadPdf")}
			className="cursor-pointer whitespace-nowrap rounded-full border border-accent-line px-2 py-1 font-mono text-accent text-tag uppercase tracking-widest transition-colors duration-150 hover:border-accent hover:no-underline sm:px-3"
		>
			↓ {t("cv.pdf")}
		</a>
	);
}
