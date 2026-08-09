import {
	copyFileSync,
	mkdtempSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { withPage } from "./browser.js";

/**
 * Measures the metrics a fallback @font-face override needs, in an engine that
 * will apply them: the shipped faces off their own files, and any local family
 * named on the command line off the machine's own copy.
 *
 * Ratios, never pixels — every number is normalised by the size it was measured
 * at, which is the form `size-adjust` and the *-override descriptors take.
 *
 * Newsreader carries an optical-size axis, so its ratios are a curve rather
 * than a constant: the axis is pinned per row through the face rather than left
 * to resolve off the font size, which is what lets one large, precise
 * measurement stand in for a size the ink box would otherwise quantise away.
 *
 *     node scripts/font-metrics.js [local-family ...]
 */

/** Large enough that the ink box's own rounding is far below the last digit. */
const SIZE = 2000;

/** The optical sizes the page asks for: text-lg, text-lede, text-title, the
    h1's clamp floor and ceiling, and the middle of that clamp. */
const OPSZ = [18, 22, 38, 48, 62];

const FONT_DIR = "public/fonts";

const local = process.argv.slice(2);

const root = mkdtempSync(join(tmpdir(), "font-metrics-"));
const fonts = readdirSync(FONT_DIR).filter((name) => name.endsWith(".woff2"));

for (const name of fonts) copyFileSync(join(FONT_DIR, name), join(root, name));
writeFileSync(
	join(root, "index.html"),
	"<!doctype html><title>metrics</title>",
);

const PROBE = `(async () => {
  const SIZE = ${SIZE};
  const OPSZ = ${JSON.stringify(OPSZ)};
  const files = ${JSON.stringify(fonts)};
  const local = ${JSON.stringify(local)};

  if (!("variationSettings" in FontFace.prototype)) {
    throw new Error("this Chrome cannot pin a variation axis per face");
  }

  const ctx = document.createElement("canvas").getContext("2d");

  const face = async (family, source, opsz) => {
    const font = new FontFace(
      family,
      source,
      opsz ? { variationSettings: '"opsz" ' + opsz } : {},
    );
    // Rejects rather than substituting when a local family is not installed,
    // which is the only reliable presence test for a system font.
    await font.load();
    document.fonts.add(font);
  };

  const measure = (family) => {
    ctx.font = SIZE + "px " + JSON.stringify(family);
    const word = ctx.measureText("Victor Pierozan");
    const x = ctx.measureText("x");
    const cap = ctx.measureText("H");
    return {
      ascent: word.fontBoundingBoxAscent / SIZE,
      descent: word.fontBoundingBoxDescent / SIZE,
      xHeight: x.actualBoundingBoxAscent / SIZE,
      capHeight: cap.actualBoundingBoxAscent / SIZE,
      // A frequency-blind average, but taken over the two strings that carry
      // the jump: what matters is the ratio between two faces, not the number.
      advance: word.width / SIZE,
    };
  };

  const curve = async (family, source) => {
    const out = {};
    for (const opsz of OPSZ) {
      const pinned = family + "-" + opsz;
      await face(pinned, source, opsz);
      out[opsz] = measure(pinned);
    }
    return out;
  };

  const out = {};

  for (const file of files) {
    const source = 'url("/' + file + '") format("woff2")';
    await face("probe-" + file, source);
    out[file] = { base: measure("probe-" + file), curve: await curve("probe-" + file, source) };
  }

  for (const family of local) {
    try {
      await face("probe-local-" + family, 'local("' + family + '")');
      out[family] = { base: measure("probe-local-" + family), curve: null };
    } catch {
      out[family] = null;
    }
  }

  return out;
})()`;

try {
	const measured = await withPage(root, async ({ evaluate, goto }) => {
		await goto("/index.html");
		return evaluate(PROBE);
	});

	for (const [name, m] of Object.entries(measured)) {
		if (!m) {
			console.info(`${name}: not installed`);
			continue;
		}
		console.info(`${name}`);
		console.info(`  ${row("default", m.base)}`);
		for (const [opsz, at] of Object.entries(m.curve ?? {})) {
			console.info(`  ${row(`opsz ${opsz}`, at)}`);
		}
	}
} finally {
	rmSync(root, { force: true, recursive: true });
}

function row(label, m) {
	return [
		label.padEnd(10),
		`x-height ${round(m.xHeight)}`,
		`cap ${round(m.capHeight)}`,
		`ascent ${round(m.ascent)}`,
		`descent ${round(m.descent)}`,
		`advance ${round(m.advance)}`,
	].join("  ");
}

function round(value) {
	return value.toFixed(4);
}
