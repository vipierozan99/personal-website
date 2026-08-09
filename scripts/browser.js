import { spawn } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

/**
 * A real browser, driven over the devtools protocol, for the two build
 * artifacts that cannot be produced without a layout engine: where the CV's
 * sheets break, and the printed PDFs.
 *
 * Both run on a developer's machine rather than in CI — which is why the
 * answers they produce are committed — so this only has to find a Chrome that
 * is already installed, and say so plainly when there is none.
 */
const CHROME_CANDIDATES = [
	process.env.CHROME_PATH,
	"/usr/bin/google-chrome",
	"/usr/bin/google-chrome-stable",
	"/usr/bin/chromium",
	"/usr/bin/chromium-browser",
	"/opt/google/chrome/chrome",
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const TYPES = {
	".css": "text/css",
	".html": "text/html; charset=utf-8",
	".jpeg": "image/jpeg",
	".js": "text/javascript",
	".json": "application/json",
	".pdf": "application/pdf",
	".png": "image/png",
	".txt": "text/plain; charset=utf-8",
	".woff2": "font/woff2",
	".xml": "application/xml",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findChrome() {
	const chrome = CHROME_CANDIDATES.find((path) => path && existsSync(path));
	if (!chrome) {
		throw new Error(
			"no Chrome found — set CHROME_PATH, or install one; this step measures a real layout and cannot be faked",
		);
	}
	return chrome;
}

/**
 * The built site over HTTP rather than `file://`: module scripts, the fonts
 * and the content chunks are all fetched, and none of that behaves the same
 * on a file URL. Directories resolve to their own index.html — /cv is a
 * prerendered page of its own, not a client-side fallback.
 */
function serve(root) {
	const server = createServer((req, res) => {
		const path = req.url.split("?")[0];
		let file = join(root, path === "/" ? "index.html" : path);
		if (existsSync(file) && statSync(file).isDirectory()) {
			file = join(file, "index.html");
		}
		if (!existsSync(file)) {
			file = join(root, "index.html");
		}
		res.writeHead(200, {
			"Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
		});
		res.end(readFileSync(file));
	});

	return new Promise((resolve) => {
		server.listen(0, "127.0.0.1", () => {
			const { port } = server.address();
			resolve({
				origin: `http://127.0.0.1:${port}`,
				close: () => new Promise((done) => server.close(done)),
			});
		});
	});
}

/** The websocket URL Chrome prints once it is ready to be driven. */
function launch(chrome, profile) {
	const child = spawn(chrome, [
		"--headless=new",
		"--remote-debugging-port=0",
		`--user-data-dir=${profile}`,
		"--hide-scrollbars",
		"--force-device-scale-factor=1",
		// Zeroes --anim (index.css), so view transitions and the loading
		// spinner collapse to instant swaps: a print taken moments after a
		// language switch cannot catch an animation mid-flight, which is what
		// made the PDFs differ run to run.
		"--force-prefers-reduced-motion",
		// Wide enough that --cv-fit (index.css) stays 1: measuring a
		// deliberately shrunken layout would pack the sheets against the wrong
		// capacity. Headless also reports pointer: fine, which the fit is gated
		// on, so this is the second of two guards rather than the only one.
		"--window-size=1400,1000",
		"about:blank",
	]);

	return new Promise((resolve, reject) => {
		let stderr = "";
		const timer = setTimeout(() => {
			reject(new Error(`Chrome did not report a devtools port:\n${stderr}`));
		}, 30_000);

		child.stderr.on("data", (chunk) => {
			stderr += chunk;
			const match = stderr.match(/ws:\/\/[^\s]+/);
			if (!match) return;
			clearTimeout(timer);
			resolve({ child, browserWs: match[0] });
		});
		child.on("exit", (code) => {
			clearTimeout(timer);
			reject(new Error(`Chrome exited with ${code}:\n${stderr}`));
		});
	});
}

async function pageTarget(browserWs) {
	const port = new URL(browserWs).port;
	for (let attempt = 0; attempt < 40; attempt++) {
		try {
			const targets = await (
				await fetch(`http://127.0.0.1:${port}/json/list`)
			).json();
			const page = targets.find((target) => target.type === "page");
			if (page) return page.webSocketDebuggerUrl;
		} catch {
			// Chrome answers the endpoint a moment after it prints the port.
		}
		await sleep(100);
	}
	throw new Error("Chrome exposed no page to drive");
}

function connect(url) {
	const socket = new WebSocket(url);
	const pending = new Map();
	const waiters = new Map();
	let nextId = 1;

	socket.addEventListener("message", (event) => {
		const message = JSON.parse(event.data);
		if (message.id === undefined) {
			// An event rather than a reply: hand it to whoever asked for that
			// method and forget them, since every wait here is for one occurrence.
			const waiting = waiters.get(message.method);
			waiters.delete(message.method);
			waiting?.();
			return;
		}
		const resolve = pending.get(message.id);
		if (!resolve) return;
		pending.delete(message.id);
		resolve(message);
	});

	/** Resolves the next time Chrome emits `method`. */
	const once = (method) =>
		new Promise((resolve) => waiters.set(method, resolve));

	const ready = new Promise((resolve) =>
		socket.addEventListener("open", resolve, { once: true }),
	);

	const send = async (method, params = {}) => {
		await ready;
		const id = nextId++;
		const reply = await new Promise((resolve) => {
			pending.set(id, resolve);
			socket.send(JSON.stringify({ id, method, params }));
		});
		if (reply.error) {
			throw new Error(`${method} failed: ${JSON.stringify(reply.error)}`);
		}
		return reply.result;
	};

	return { send, once, close: () => socket.close() };
}

/**
 * Runs `visit` against the built site in a browser, then takes everything
 * down. The callback gets `goto`, `evaluate` and the raw `send`, which is all
 * either artifact needs.
 */
export async function withPage(root, visit) {
	const chrome = findChrome();
	const profile = mkdtempSync(join(tmpdir(), "site-prepress-"));
	const site = await serve(root);
	let browser;

	try {
		browser = await launch(chrome, profile);
		const { send, once, close } = connect(await pageTarget(browser.browserWs));
		await send("Page.enable");
		await send("Runtime.enable");

		const evaluate = async (expression) => {
			const result = await send("Runtime.evaluate", {
				expression,
				awaitPromise: true,
				returnByValue: true,
			});
			if (result.exceptionDetails) {
				throw new Error(
					`page threw: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`,
				);
			}
			return result.result.value;
		};

		const goto = async (path) => {
			// Subscribed before the navigation is asked for, so a page that loads
			// immediately cannot resolve into nobody listening.
			const loaded = once("Page.loadEventFired");
			await send("Page.navigate", { url: `${site.origin}${path}` });
			await loaded;
		};

		const result = await visit({ evaluate, send, goto, origin: site.origin });
		close();
		return result;
	} finally {
		if (browser) {
			// Wait for the process to actually die: removing the profile while
			// Chrome is still flushing it races into ENOTEMPTY.
			const gone = new Promise((resolve) =>
				browser.child.once("exit", resolve),
			);
			browser.child.kill();
			await gone;
		}
		await site.close();
		rmSync(profile, {
			force: true,
			recursive: true,
			maxRetries: 5,
			retryDelay: 100,
		});
	}
}

/**
 * The languages the CV document actually exists in, from the content
 * directories. Deliberately not scraped from the language pills: those also
 * offer locales that fall back to the English document, and capturing or
 * printing one of those would duplicate English under another name.
 */
export const cvLocales = () =>
	readdirSync("src/content", { withFileTypes: true })
		.filter(
			(entry) =>
				entry.isDirectory() &&
				existsSync(join("src/content", entry.name, "cv.md")),
		)
		.map((entry) => entry.name)
		.sort();

/**
 * Switches the page to `locale` the way a reader does: the languages live
 * behind a disclosure in the header, so the menu has to be opened before the
 * option it holds exists to be clicked.
 */
export const select = (locale) => `(async () => {
  const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
  const option = () =>
    [...document.querySelectorAll("header button[lang]")].find(
      (button) => button.lang === ${JSON.stringify(locale)},
    );
  // Polled rather than clicked once and hoped: the trigger ships in the
  // prerendered markup, so a click that lands before hydration opens nothing,
  // and giving up after one frame turns that race into a TypeError instead of
  // a retry.
  for (let attempt = 0; attempt < 60 && !option(); attempt++) {
    document.querySelector("header button[aria-expanded]")?.click();
    await frame();
  }
  const chosen = option();
  if (!chosen) throw new Error("no ${locale} option in the language menu");
  chosen.click();
})()`;

/**
 * Waits for the page to finish paginating in `locale`: the document swapped
 * (the sheets carry their language on the enclosing <main>), the faces
 * resolved, the measuring rig gone, and the sheet count holding still.
 * Reading the sheets a moment early is how a capture ends up describing the
 * previous language's flow.
 */
export const settled = (locale) => `(async () => {
  const sheets = () => {
    const rig = document.querySelector('div[aria-hidden="true"][class*="200vw"]');
    return [...document.querySelectorAll('[class*="21cm"]')].filter(
      (sheet) => !rig || !rig.contains(sheet),
    );
  };
  const rigUp = () =>
    !!document.querySelector('div[aria-hidden="true"][class*="200vw"]');
  const docLang = () =>
    document.querySelector("main[lang]")?.getAttribute("lang");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  await document.fonts.ready;
  let last = -1;
  for (let attempt = 0; attempt < 100; attempt++) {
    const count = sheets().length;
    if (
      docLang() === ${JSON.stringify(locale)} &&
      count > 0 &&
      count === last &&
      !rigUp()
    )
      return count;
    last = count;
    await wait(100);
  }
  throw new Error("pagination never settled for ${locale}");
})()`;
