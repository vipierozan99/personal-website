/**
 * React only suppresses its "not configured to support act(...)" warning when
 * the environment declares itself a test one. Vitest's browser mode is a real
 * page, so nothing sets this for us.
 */
(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
