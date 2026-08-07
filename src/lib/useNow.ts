import { useEffect, useState } from "react";

/**
 * Today's date, but only once the page is interactive. A live CV role's
 * duration would otherwise be computed from a different clock on the server
 * than in the browser and break hydration; both start from the build
 * timestamp instead, and the browser moves to the real date after mounting.
 */
export function useNow() {
	const [now, setNow] = useState(() => new Date(__BUILD_TIME__));
	useEffect(() => setNow(new Date()), []);
	return now;
}
