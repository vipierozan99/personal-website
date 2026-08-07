import "i18next";
import type en from "./en.json";

/**
 * Types `t` against the English catalog, so a mistyped or removed key is a
 * compile error rather than the key name rendering on the sheet.
 */
declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "translation";
		resources: { translation: typeof en };
	}
}
