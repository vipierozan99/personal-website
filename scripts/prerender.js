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
const HEAD_END = "</head>";

/** The language the shipped pages hydrate against; must match entry-server. */
const LOCALE = "en";

/**
 * Sizes narrow devices' viewport to the 21cm sheet before first paint —
 * the pre-hydration copy of src/components/cv/viewport.ts, injected only
 * into /cv/index.html. Keep the two in step.
 */
const VIEWPORT_SCRIPT = `  <script>
    (() => {
      const WIDTH = ${Math.ceil(21 * (96 / 2.54) + 2 * 16) + 2};
      const meta = document.querySelector('meta[name="viewport"]');
      const root = document.documentElement;
      const orientation = window.matchMedia("(orientation: portrait)");
      const apply = () => {
        const s = window.screen;
        const device = orientation.matches ? Math.min(s.width, s.height) : Math.max(s.width, s.height);
        if (device >= WIDTH) {
          meta.setAttribute("content", "width=device-width, initial-scale=1.0");
          root.style.removeProperty("--page-scale");
          return;
        }
        meta.setAttribute("content", "width=" + WIDTH);
        root.style.setProperty("--page-scale", String(WIDTH / device));
      };
      apply();
      orientation.addEventListener("change", apply);
    })();
  </script>`;

const ROUTES = [
	{ path: "/", file: `${OUT}/index.html` },
	{ path: "/cv", file: `${OUT}/cv/index.html`, headExtra: VIEWPORT_SCRIPT },
];

const template = readFileSync(`${OUT}/index.html`, "utf8");

if (!template.includes(MOUNT)) {
	throw new Error(
		`${OUT}/index.html has no ${MOUNT} to prerender into — did the mount point change?`,
	);
}

if (!template.includes(HEAD_END)) {
	throw new Error(`${OUT}/index.html has no ${HEAD_END} to preload from`);
}

// Without this the browser only learns it needs the content chunk after the
// app bundle has parsed, and the prerendered page sits unhydrated for a round
// trip.
const manifest = JSON.parse(readFileSync(`${OUT}/.vite/manifest.json`, "utf8"));
const chunk = manifest[`src/content/${LOCALE}/site.md`]?.file;

if (!chunk) {
	throw new Error(
		`manifest has no chunk for src/content/${LOCALE}/site.md — is the content still loaded through the import.meta.glob in src/content/load.ts?`,
	);
}

for (const route of ROUTES) {
	const markup = await render(route.path);

	// Replacements are functions throughout: with a string, `$&`, `$$`, "$`" and
	// `$'` inside the rendered markup would be read as substitution patterns
	// rather than copied through.
	const head = [
		`  <link rel="modulepreload" crossorigin href="/${chunk}">`,
		...(route.headExtra ? [route.headExtra] : []),
	].join("\n");

	const html = template
		.replace(HEAD_END, `${head}\n${HEAD_END}`)
		.replace(MOUNT, () => `<div id="root">${markup}</div>`);

	mkdirSync(dirname(route.file), { recursive: true });
	writeFileSync(route.file, html);
}

// info, not log: this is build progress on purpose, not a leftover debug print.
console.info(`prerendered ${ROUTES.map((route) => route.path).join(", ")}`);
