import {
	type ReactNode,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { type PackableBlock, packBlocks } from "../../lib/paginate";
import { ContinuationRule, Sheet, SheetFlow } from "./Sheet";

export type Block = {
	id: string;
	node: ReactNode;
	/** Section the block sits in, named on the continuation rule of later sheets. */
	section?: string;
	/** Set when the block opens its section, so it needs no continuation label. */
	opensSection?: boolean;
	/** Escape hatch: force this block to start a sheet regardless of the fit. */
	breakBefore?: boolean;
};

type Measurements = { capacity: number; header: number; continuation: number };

/**
 * Assigns blocks to A4 sheets by measuring them off-screen at their real
 * width, so the on-screen sheets and the printed PDF break identically. The
 * hidden rig must stay structurally identical to the visible sheets —
 * matching wrapper elements included — or the measured heights will not match
 * the rendered ones.
 */
export function AutoPaginate({
	blocks,
	header,
	footer,
	continuedLabel,
	captured,
}: {
	blocks: readonly Block[];
	header: ReactNode;
	footer: (page: number, total: number) => ReactNode;
	continuedLabel: string;
	/**
	 * Where the breaks fell when this document was measured at build time,
	 * which is what lets the first paint — the server's included — be the
	 * paginated sheets rather than one endless one. Treated as a proposal: it
	 * is validated against the blocks in hand and thrown away if it does not
	 * describe them, and the measurement below overrules it either way.
	 */
	captured?: number[][];
}) {
	const flow = useRef<HTMLDivElement>(null);
	const headerRig = useRef<HTMLDivElement>(null);
	const items = useRef<(HTMLDivElement | null)[]>([]);
	const flowEnd = useRef<HTMLDivElement>(null);
	const continuationFlow = useRef<HTMLDivElement>(null);
	const continuationEnd = useRef<HTMLDivElement>(null);
	const [pages, setPages] = useState<number[][] | null>(() =>
		describes(captured, blocks.length) ? captured : null,
	);
	// The rig only exists to be measured, so it is kept out of the
	// server-rendered markup: prerendered HTML would otherwise carry the whole
	// CV twice, once visibly and once inside an aria-hidden clone.
	const [mounted, setMounted] = useState(false);
	/**
	 * Which blocks have been measured for the last time. Nothing re-measures
	 * once the faces are in — a sheet is 21cm whatever the window does, so
	 * there is no resize to answer. Holding the array rather than a flag is
	 * what brings the rig back for a language switch: other blocks, other
	 * identity, unmeasured again.
	 */
	const [settled, setSettled] = useState<readonly Block[] | null>(null);
	const measuring = mounted && settled !== blocks;

	useEffect(() => setMounted(true), []);

	useLayoutEffect(() => {
		if (!mounted) return;
		// Refs outlive the rig that set them: unmounting nulls each entry but
		// leaves the array as long as it was, so it is cut back to the blocks in
		// hand rather than trusted for its length.
		const rig = items.current.slice(0, blocks.length);
		if (rig.length !== blocks.length || rig.some((el) => !el)) return;

		const measureRig = (): Measurements | null => {
			const flowEl = flow.current;
			const headerEl = headerRig.current;
			const firstItem = rig[0];
			const ruleFlowEl = continuationFlow.current;
			const ruleEndEl = continuationEnd.current;
			if (!flowEl || !headerEl || !firstItem || !ruleFlowEl || !ruleEndEl) {
				return null;
			}
			return {
				capacity: flowEl.clientHeight,
				header:
					firstItem.getBoundingClientRect().top -
					headerEl.getBoundingClientRect().top,
				continuation:
					ruleEndEl.getBoundingClientRect().top -
					ruleFlowEl.getBoundingClientRect().top,
			};
		};

		const measure = () => {
			const sizes = measureRig();
			if (!sizes) return false;

			const packable: PackableBlock[] = occupiedHeights(
				rig,
				flowEnd.current,
			).map((height, index) => ({
				height,
				breakBefore: blocks[index].breakBefore,
			}));

			if (import.meta.env.DEV) {
				warnOversized(packable, sizes.capacity - sizes.continuation, blocks);
			}

			const packed = packBlocks(
				packable,
				sizes.capacity - sizes.continuation,
				sizes.capacity - sizes.header,
			);

			// Returning the state it already holds is React's own signal to stop,
			// and what the captured pagination buys: when the measurement agrees
			// with it, which is the ordinary case, the sheets are never rebuilt.
			setPages((current) => (samePages(current, packed) ? current : packed));
			return true;
		};

		const fonts = document.fonts;

		if (!fonts) {
			if (measure()) setSettled(blocks);
			return;
		}

		// Web fonts resolve after first layout and change every block's height,
		// so a pass taken while one is still loading measures the fallback and
		// is thrown away the moment the real metrics arrive. `fonts.ready` is
		// the authority either way — the eager pass is only for the visit that
		// already has them.
		if (fonts.status === "loaded") measure();

		let stale = false;
		fonts.ready.then(() => {
			if (!stale && measure()) setSettled(blocks);
		});
		return () => {
			stale = true;
		};
	}, [blocks, mounted]);

	return (
		<>
			{!pages && (
				<UnpaginatedFlow blocks={blocks} header={header} footer={footer} />
			)}

			{pages?.map((indices, page) => (
				<Sheet key={blocks[indices[0]]?.id ?? page}>
					<SheetFlow>
						{page === 0 ? (
							header
						) : (
							<ContinuationRule
								{...continuationFor(blocks[indices[0]], continuedLabel)}
							/>
						)}
						{indices.map((index) => (
							<div key={blocks[index].id} className="break-inside-avoid">
								{blocks[index].node}
							</div>
						))}
					</SheetFlow>
					{footer(page + 1, pages.length)}
				</Sheet>
			))}

			{measuring && (
				<div
					aria-hidden="true"
					className="invisible fixed top-0 left-[-200vw] print:hidden"
				>
					<Sheet>
						<SheetFlow ref={flow}>
							<div ref={headerRig}>{header}</div>
							{blocks.map((block, index) => (
								<div
									key={block.id}
									className="break-inside-avoid"
									ref={(el) => {
										items.current[index] = el;
									}}
								>
									{block.node}
								</div>
							))}
							<div ref={flowEnd} />
						</SheetFlow>
						{footer(1, 1)}
					</Sheet>

					{/* Second rig: what a continuation rule costs a sheet, measured
					    rather than derived, because its negative top margin means the
					    space it occupies is not the same as its own height. */}
					<Sheet>
						<SheetFlow ref={continuationFlow}>
							<ContinuationRule label="—" suffix={continuedLabel} />
							<div ref={continuationEnd} />
						</SheetFlow>
						{footer(1, 1)}
					</Sheet>
				</div>
			)}
		</>
	);
}

/**
 * A sheet that starts part-way through a section says so; one that happens to
 * start on a section's own rule would only repeat it, and gets the bare rule.
 */
function continuationFor(block: Block | undefined, continuedLabel: string) {
	if (!block?.section || block.opensSection) return {};
	return { label: block.section, suffix: continuedLabel };
}

/**
 * Whether a captured pagination still describes the document in hand: every
 * sheet holding something, and the indices running from nothing to the last
 * block without a gap. A capture taken before the content changed describes
 * some other document — so it is checked rather than trusted, and a stale one
 * simply costs the measurement it was there to save.
 */
function describes(
	captured: number[][] | undefined,
	count: number,
): captured is number[][] {
	if (!captured?.length) return false;

	let expected = 0;
	for (const sheet of captured) {
		if (sheet.length === 0) return false;
		for (const index of sheet) {
			if (index !== expected) return false;
			expected += 1;
		}
	}
	return expected === count;
}

/**
 * Whether two packings break in the same places. Both are runs of consecutive
 * indices over the same blocks, so how many land on each sheet says it all.
 */
function samePages(current: number[][] | null, packed: number[][]) {
	return (
		current?.length === packed.length &&
		current.every((sheet, page) => sheet.length === packed[page].length)
	);
}

/**
 * The render before any measurement has happened: a single sheet that grows
 * to fit everything, in document order. This is what the prerendered HTML
 * contains, so crawlers and link unfurlers — which never run the measuring
 * pass — still get the whole CV. It is also the client's first render, which
 * keeps hydration free of mismatches before the real sheets replace it.
 */
function UnpaginatedFlow({
	blocks,
	header,
	footer,
}: {
	blocks: readonly Block[];
	header: ReactNode;
	footer: (page: number, total: number) => ReactNode;
}) {
	return (
		<Sheet fit="content">
			<SheetFlow>
				{header}
				{blocks.map((block) => (
					<div key={block.id} className="break-inside-avoid">
						{block.node}
					</div>
				))}
			</SheetFlow>
			{footer(1, 1)}
		</Sheet>
	);
}

/**
 * Derives each item's occupied height from the distance to the next item
 * rather than from offsetHeight, so vertical margins — including collapsed
 * ones between adjacent blocks — are counted exactly once.
 */
function occupiedHeights(
	items: readonly (HTMLElement | null)[],
	flowEnd: HTMLElement | null,
) {
	const tops = items.map((el) => el?.getBoundingClientRect().top ?? 0);
	const end = flowEnd?.getBoundingClientRect().top ?? 0;
	return tops.map((top, i) => (i + 1 < tops.length ? tops[i + 1] : end) - top);
}

function warnOversized(
	packable: readonly PackableBlock[],
	capacity: number,
	blocks: readonly Block[],
) {
	packable.forEach(({ height }, index) => {
		if (height > capacity) {
			console.warn(
				`[AutoPaginate] block "${blocks[index].id}" is ${Math.round(height)}px tall but a sheet fits only ${Math.round(capacity)}px. It will overflow — split it into two blocks.`,
			);
		}
	});
}
