/**
 * dates.test.ts asserts that a UTC-midnight `__BUILD_TIME__` is read as its UTC
 * month, which only reproduces west of UTC. The offset is configured in
 * vite.config.ts; this fails the run loudly if it ever stops being applied,
 * rather than letting that test quietly start passing for the wrong reason.
 *
 * Read back from Intl rather than the env var, so it is the zone the Date
 * methods will actually use that gets checked.
 */
const PINNED = "America/Sao_Paulo";
const actual = Intl.DateTimeFormat().resolvedOptions().timeZone;

if (actual !== PINNED) {
	throw new Error(
		`unit tests expect TZ=${PINNED}, got ${actual} — ` +
			"see the unit project in vite.config.ts",
	);
}
