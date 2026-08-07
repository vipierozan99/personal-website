import { useEffect, useRef, useState } from "react";
import { crossfade } from "./transitions";

/**
 * Whether a capped panel actually overflows its max-height, and the expanded
 * state that lifts the cap. Measured with a ResizeObserver on the scroller and
 * its content, so the fade and the button appear only when there is something
 * to reveal — the server renders neither, and they settle in after mount.
 */
export function usePanelOverflow<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [overflowing, setOverflowing] = useState(false);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		// 8px of slack: a rounding-height "overflow" is not worth a button.
		const measure = () => setOverflowing(el.scrollHeight - el.clientHeight > 8);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		if (el.firstElementChild) observer.observe(el.firstElementChild);
		return () => observer.disconnect();
	}, []);

	return {
		ref,
		expanded,
		fade: overflowing && !expanded,
		showButton: overflowing || expanded,
		toggle: () => crossfade(() => setExpanded((value) => !value)),
	};
}
