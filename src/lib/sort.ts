/** Orders anything dated by year, newest or oldest first. */
export const byYear =
	(newestFirst: boolean) =>
	(a: { year: number }, b: { year: number }): number =>
		newestFirst ? b.year - a.year : a.year - b.year;
