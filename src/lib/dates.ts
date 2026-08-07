import type { TFunction } from "i18next";

/** `2024-10` -> `10/24`. */
export function shortMonth(iso: string) {
	const [year, month] = iso.split("-");
	return `${month}/${year.slice(2)}`;
}

export function monthsBetween(from: string, to: Date | string) {
	const [fromYear, fromMonth] = from.split("-").map(Number);
	const [toYear, toMonth] =
		typeof to === "string"
			? to.split("-").map(Number)
			: [to.getFullYear(), to.getMonth() + 1];
	return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

/**
 * The join stays here rather than in one ICU message: expressing "years only,
 * months only, or both" as a single nested plural is unreadable and worse to
 * translate than two independent messages.
 */
export function formatDuration(months: number, t: TFunction) {
	const years = Math.floor(months / 12);
	const rest = months % 12;
	const parts = [];
	if (years) parts.push(t("cv.years", { count: years }));
	if (rest || !years) parts.push(t("cv.months", { count: rest }));
	return parts.join(" ");
}
