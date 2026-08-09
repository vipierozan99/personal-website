import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

/** Same length and curve as ::view-transition-group in index.css, so a panel
 *  reveal reads as the same gesture as every other swap on the page. */
const DURATION = 400;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/** The global speed factor, which reduced motion pins to 0. */
function animScale() {
	const raw = getComputedStyle(document.documentElement).getPropertyValue(
		"--anim",
	);
	const value = Number.parseFloat(raw);
	return Number.isFinite(value) ? value : 1;
}

/**
 * Whether a capped panel actually overflows its max-height, and the expanded
 * state that lifts the cap. Measured with a ResizeObserver on the scroller and
 * its content, so the fade and the button appear only when there is something
 * to reveal — the server renders neither, and they settle in after mount.
 *
 * Expanding animates the scroller's real height rather than a transform: the
 * text inside must not stretch, and the content below has to move with the box.
 */
export function usePanelOverflow<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const animation = useRef<Animation | null>(null);
	const expandedRef = useRef(false);
	const cap = useRef<number | null>(null);
	const [overflowing, setOverflowing] = useState(false);
	const [expanded, setExpanded] = useState(false);

	const measure = useCallback(() => {
		const el = ref.current;
		if (!el) return;
		// The cap is a layout fact only while the panel is capped and still —
		// expanded there is none, and mid-animation the height is a tween.
		if (!expandedRef.current && !animation.current)
			cap.current = el.clientHeight;
		// Whether the whole list is taller than the cap, which is true in every
		// state: scrollHeight is the content's extent, not the box's. Asking
		// instead whether it is scrolling *now* answers "no" the moment it is
		// expanded, and unmounts the button as soon as a collapse begins.
		// 8px of slack: a rounding-height "overflow" is not worth a button.
		if (cap.current !== null) setOverflowing(el.scrollHeight > cap.current + 8);
	}, []);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		if (el.firstElementChild) observer.observe(el.firstElementChild);
		return () => observer.disconnect();
	}, [measure]);

	const toggle = () => {
		const el = ref.current;
		const next = !expandedRef.current;
		// measure() runs from a ResizeObserver, outside React's view of state.
		expandedRef.current = next;
		const duration = el?.animate ? DURATION * animScale() : 0;
		if (!el || duration === 0) {
			setExpanded(next);
			return;
		}

		const from = el.getBoundingClientRect().height;
		// Clear an in-flight run's overrides before reading the target: a lingering
		// max-height:none would make a collapse measure the uncapped height.
		animation.current?.cancel();
		el.style.maxHeight = "";
		el.style.overflow = "";
		// The swap has to land in the DOM before the target height can be read.
		flushSync(() => setExpanded(next));
		const to = el.getBoundingClientRect().height;

		// The cap would clamp the tween; hidden overflow is what makes the reveal
		// read as a wipe rather than content spilling past the box.
		el.style.maxHeight = "none";
		el.style.overflow = "hidden";
		const run = el.animate(
			{ height: [`${from}px`, `${to}px`] },
			{ duration, easing: EASING },
		);
		animation.current = run;
		const settle = () => {
			// A cancelled run settles too; only the current one owns the styles.
			if (animation.current !== run) return;
			animation.current = null;
			el.style.maxHeight = "";
			el.style.overflow = "";
			measure();
		};
		run.finished.then(settle, settle);
	};

	return {
		ref,
		expanded,
		overflowing,
		toggle,
	};
}
