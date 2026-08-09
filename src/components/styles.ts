/**
 * Class strings shared between components. They live in a module of their own
 * because a component file that also exports a constant stops being a React
 * Fast Refresh boundary, and every edit to it reloads the page instead.
 */

/** The bare text-button style the section headers share. */
export const headerButton =
	"cursor-pointer font-mono text-tag uppercase tracking-tag text-accent";
