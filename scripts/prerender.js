import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { render } from "../dist-ssr/entry-server.js";

/**
 * Renders every route into static HTML around the client build's template.
 * The template is read once before anything is written, so a failure leaves
 * the build output as vite left it rather than half-rewritten.
 */
const OUT = "dist";
const MOUNT = '<div id="root"></div>';

const ROUTES = [
	{ path: "/", file: `${OUT}/index.html` },
	{ path: "/cv", file: `${OUT}/cv/index.html` },
];

const template = readFileSync(`${OUT}/index.html`, "utf8");

if (!template.includes(MOUNT)) {
	throw new Error(
		`${OUT}/index.html has no ${MOUNT} to prerender into — did the mount point change?`,
	);
}

for (const route of ROUTES) {
	const markup = await render(route.path);

	// Replacements are functions throughout: with a string, `$&`, `$$`, "$`" and
	// `$'` inside the rendered markup would be read as substitution patterns
	// rather than copied through.
	const html = template.replace(MOUNT, () => `<div id="root">${markup}</div>`);

	mkdirSync(dirname(route.file), { recursive: true });
	writeFileSync(route.file, html);
}

// info, not log: this is build progress on purpose, not a leftover debug print.
console.info(`prerendered ${ROUTES.map((route) => route.path).join(", ")}`);
