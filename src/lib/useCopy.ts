import { useEffect, useRef, useState } from "react";

/**
 * Copies text and reports a short-lived acknowledgement, so a caller only has
 * to pick which of two labels to render. The part worth writing once is the
 * timer, whose cleanup is what stops a copy on an unmounting tree.
 */
export function useCopy(text: string, ms = 2000) {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	return {
		copied,
		copy: () => {
			navigator.clipboard?.writeText(text);
			setCopied(true);
			clearTimeout(timer.current);
			timer.current = setTimeout(() => setCopied(false), ms);
		},
	};
}
