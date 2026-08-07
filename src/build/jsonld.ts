import { type Identity, SITE_URL } from "../content/identity";
import type { CvModel } from "./cv-data";

/**
 * schema.org `Person`, derived from the CV rather than written alongside it —
 * the page cannot say something the document does not. One block serves both
 * routes: the homepage and the CV describe the same person, and the `url`
 * stays the canonical site root.
 *
 * Employment *history* is deliberately absent: `Person.worksFor` takes an
 * `Organization`, and the consumers that read this — search engines — do not
 * follow the OrganizationRole wrapper that could carry dates.
 */
export function renderJsonLd(cv: CvModel, id: Identity): string {
	const { person } = cv;
	const site = `${SITE_URL}/`;
	// Newest first, so the current job is the one the page claims.
	const current = cv.roles[0];

	return `${JSON.stringify(
		{
			"@context": "https://schema.org",
			"@type": "Person",
			name: person.name,
			givenName: id.givenName,
			additionalName: id.additionalName,
			familyName: id.familyName,
			jobTitle: current?.title,
			description: cv.summary,
			url: site,
			email: person.email,
			image: {
				"@type": "ImageObject",
				url: new URL(id.image.path, site).href,
				width: id.image.width,
				height: id.image.height,
			},
			address: {
				"@type": "PostalAddress",
				addressLocality: id.address.locality,
				addressRegion: id.address.region,
				addressCountry: id.address.country,
			},
			nationality: id.nationality.map((name) => ({
				"@type": "Country",
				name,
			})),
			// Only while the newest role is still open-ended. A CV whose most
			// recent entry has an end date should not claim a current employer.
			worksFor:
				current && !current.to
					? { "@type": "Organization", name: current.org }
					: undefined,
			hasOccupation: current && {
				"@type": "Occupation",
				name: current.title,
				occupationLocation: { "@type": "City", name: id.address.locality },
				skills: keywords(cv).join(", "),
			},
			alumniOf: cv.institutions.map((abbreviation) => {
				const institution = id.institutions[abbreviation];
				if (!institution) {
					throw new Error(
						`::academia names "${abbreviation}", which has no entry in IDENTITY.institutions — add its legal name there`,
					);
				}
				return {
					"@type": "CollegeOrUniversity",
					name: institution.name,
					sameAs: institution.url,
				};
			}),
			knowsLanguage: id.knowsLanguage,
			// Broad topics for a human's search, the concrete stack for a keyword
			// matcher.
			knowsAbout: [...new Set([...id.topics, ...keywords(cv)])],
			sameAs: [...person.links.map((link) => link.href), ...id.sameAs],
		},
		// `undefined` values are dropped by JSON.stringify, which is what makes
		// the optional fields above collapse cleanly.
		null,
		2,
	)}\n`;
}

const keywords = (cv: CvModel) => cv.skills.flatMap((skill) => skill.keywords);
