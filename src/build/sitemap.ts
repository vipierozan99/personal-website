import { SITE_URL } from "../content/identity";

/**
 * sitemap.xml for the two routes. Language variants live behind `?lang=` on
 * one URL, so they are hreflang alternates of each page rather than entries
 * of their own; the CV lists only the languages it actually has a document
 * for (PT falls back to English and should not claim otherwise).
 */
export function renderSitemap(
	siteLocales: readonly string[],
	cvLocales: readonly string[],
): string {
	const pages = [
		{ path: "/", locales: siteLocales },
		{ path: "/cv", locales: cvLocales },
	];

	const urls = pages.map(({ path, locales }) => {
		const loc = `${SITE_URL}${path}`;
		const variant = (locale: string) =>
			locale === "en" ? loc : `${loc}?lang=${locale}`;
		const alternates = [
			...locales.map(
				(locale) =>
					`    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(variant(locale))}"/>`,
			),
			`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}"/>`,
		];
		return [
			"  <url>",
			`    <loc>${escapeXml(loc)}</loc>`,
			...alternates,
			"  </url>",
		].join("\n");
	});

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		...urls,
		"</urlset>",
		"",
	].join("\n");
}

const escapeXml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll('"', "&quot;");
