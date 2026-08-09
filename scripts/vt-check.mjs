import { withPage } from "./browser.js";

/**
 * That a route change cross-fades, once, over the finished page.
 *
 * Counts real `document.startViewTransition` calls in a real browser, because
 * every way this breaks is invisible to a unit test and silent in the build:
 * the boot load transitioning against itself, `/cv` committing on its empty
 * placeholder before the document chunk lands, `?lang=` dropped by a <Link>
 * that forgot `search`, or the sheet fit landing after the snapshot.
 *
 * Manual, like the other browser scripts here — it needs a local Chrome, and
 * runs against `dist`, so build first. `node scripts/vt-check.mjs`.
 */

const INSTRUMENT = `
window.__vt = [];
window.__sawPlaceholder = false;
const real = document.startViewTransition;
if (real) {
  document.startViewTransition = function (arg) {
    window.__vt.push(location.pathname + location.search);
    // Wrap the update callback so we can read --cv-fit at the instant the DOM
    // is final and the browser is about to snapshot it. A value of 1 here
    // means the snapshot caught unscaled 21cm sheets.
    const cb = typeof arg === "function" ? arg : arg && arg.update;
    const wrap = async () => {
      const out = await cb();
      window.__fitAtCommit = getComputedStyle(document.documentElement)
        .getPropertyValue("--cv-fit").trim();
      return out;
    };
    const next = typeof arg === "function" ? wrap : { ...arg, update: wrap };
    return real.call(this, cb ? next : arg);
  };
}
const watch = () => {
  if (document.querySelector('[class*="min-h-[40vh]"]')) window.__sawPlaceholder = true;
  requestAnimationFrame(watch);
};
requestAnimationFrame(watch);
window.__snap = () => JSON.stringify({
  vt: window.__vt,
  placeholder: window.__sawPlaceholder,
  path: location.pathname,
  search: location.search,
  lang: document.querySelector("main[lang]")?.getAttribute("lang"),
  sheets: document.querySelectorAll('[class*="21cm"]').length,
});
`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const click = (selector) => `(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) throw new Error("no element for " + ${JSON.stringify(selector)});
  el.click();
  return true;
})()`;

const results = [];
const check = (name, pass, detail) => {
	results.push({ name, pass, detail });
	console.info(
		`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
};

await withPage("dist", async ({ evaluate, send, goto }) => {
	await send("Page.addScriptToEvaluateOnNewDocument", { source: INSTRUMENT });

	// 1. Boot load must not open a transition.
	await goto("/");
	await sleep(1200);
	const bootVt = await evaluate("window.__vt.length");
	check("no view transition on boot", bootVt === 0, `count=${bootVt}`);

	// 2. / -> /cv cold: exactly one transition, placeholder never rendered.
	await evaluate(click('header a[href="/cv"]'));
	await sleep(1500);
	const nav = JSON.parse(await evaluate("window.__snap()"));
	check(
		"/ -> /cv opens exactly one transition",
		nav.vt.length === 1,
		JSON.stringify(nav.vt),
	);
	check(
		"/ -> /cv never shows the empty placeholder",
		nav.placeholder === false,
	);
	check(
		"/cv committed with real sheets",
		nav.path === "/cv" && nav.sheets > 0,
		`sheets=${nav.sheets}`,
	);

	// 3. /cv -> / via the header name link.
	await evaluate(click('header a[href="/"]'));
	await sleep(1200);
	const back = JSON.parse(await evaluate("window.__snap()"));
	check(
		"/cv -> / opens one more transition",
		back.vt.length === 2,
		JSON.stringify(back.vt),
	);

	// 4. Back/forward must transition too (popstate never reaches commitLocation).
	await send("Runtime.evaluate", { expression: "history.back()" });
	await sleep(1200);
	const pop = JSON.parse(await evaluate("window.__snap()"));
	check("back button transitions", pop.vt.length === 3, JSON.stringify(pop.vt));

	// 5. ?lang= survives a route navigation, and the CV renders in that language.
	await goto("/?lang=de");
	await sleep(1500);
	// Deep-linking ?lang=de crossfades English -> German content on boot
	// (LanguageProvider's own swap, pre-existing). Only the delta across the
	// click is the navigation's.
	const beforeDe = JSON.parse(await evaluate("window.__snap()"));
	await evaluate(click('header a[href^="/cv"]'));
	await sleep(2500);
	const de = JSON.parse(await evaluate("window.__snap()"));
	const navFades = de.vt.length - beforeDe.vt.length;
	check(
		"?lang=de carried across the nav",
		de.search === "?lang=de",
		`search=${de.search}`,
	);
	check(
		"German CV in a single fade",
		navFades === 1 && de.lang === "de",
		`navFades=${navFades} lang=${de.lang} vt=${JSON.stringify(de.vt)}`,
	);
	check("no placeholder on the German path", de.placeholder === false);
});

// 6. Narrow viewport: the snapshot must already carry the scaled sheets.
await withPage("dist", async ({ evaluate, send, goto }) => {
	await send("Page.addScriptToEvaluateOnNewDocument", { source: INSTRUMENT });
	await send("Emulation.setDeviceMetricsOverride", {
		width: 390,
		height: 844,
		screenWidth: 390,
		screenHeight: 844,
		deviceScaleFactor: 1,
		mobile: false,
	});
	await goto("/");
	await sleep(1500);
	await evaluate(click('header a[href="/cv"]'));
	await sleep(2500);
	const narrow = JSON.parse(await evaluate("window.__snap()"));
	const atCommit = await evaluate("window.__fitAtCommit");
	const settled = await evaluate(
		"getComputedStyle(document.documentElement).getPropertyValue('--cv-fit').trim()",
	);
	check(
		"390px: sheets already scaled when the snapshot is taken",
		atCommit !== undefined && Number(atCommit) < 1 && atCommit === settled,
		`atCommit=${atCommit} settled=${settled}`,
	);
	check(
		"390px: still one transition, no placeholder",
		narrow.vt.length === 1 && !narrow.placeholder,
		JSON.stringify(narrow.vt),
	);
});

const failed = results.filter((r) => !r.pass);
console.info(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
