/**
 * Covers the page while the content for a newly selected language is fetched.
 *
 * An overlay rather than a replacement: the sheets underneath stay mounted,
 * so AutoPaginate keeps its measurements and the page count does not collapse
 * to one and back. It also hides the moment the inverted language switch
 * creates — the chrome has already changed language while the sheets still
 * hold the previous one's prose.
 *
 * The spinner is `motion-safe` only — the reduced-motion preference zeroes
 * `--anim`, which would otherwise leave a frozen ring on screen with no hint
 * that anything is happening. The label carries that on its own.
 */
export function LoadingOverlay({ label }: { label: string }) {
	return (
		<div
			role="status"
			aria-live="polite"
			className="fixed inset-0 z-100 flex items-center justify-center gap-[0.7em] bg-band/80 font-mono text-[calc(14px*var(--page-scale,1))] text-ink-3 tracking-widest backdrop-blur-[3px] print:hidden"
		>
			<span
				aria-hidden="true"
				className="size-[1.15em] rounded-full border-2 border-accent-line border-t-accent motion-safe:animate-spin"
			/>
			{label}
		</div>
	);
}
