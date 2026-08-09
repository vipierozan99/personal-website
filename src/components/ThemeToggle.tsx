import { useT } from "../lib/lang-context";
import { useThemeToggle } from "../lib/theme";

/**
 * A switch whose state lives in the DOM, not in React: the theme is an
 * attribute on <html> set before first paint, so both icons and both knob
 * positions ship in the markup and the `dark:` variant picks between them.
 * That is also why there is no aria-checked — asserting the state would need
 * it in React, which is the hydration mismatch this avoids. The label carries
 * the meaning instead.
 */
export function ThemeToggle() {
	const t = useT();
	const toggle = useThemeToggle();

	return (
		<button
			type="button"
			onClick={toggle}
			title={t("theme.toggle")}
			aria-label={t("theme.toggle")}
			className="relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-accent-line transition-colors duration-150 hover:border-accent"
		>
			{/* Each glyph sits on the half the knob is not on: in light the knob
			    is left and the moon shows on the right, in dark they trade. Put
			    them on the same side and the visible one paints on top of the
			    knob, which is the whole of the illusion gone. */}
			<span
				aria-hidden="true"
				className="absolute right-1.5 text-[0.8rem] text-accent leading-none transition-opacity duration-150 dark:opacity-0"
			>
				☾
			</span>
			<span
				aria-hidden="true"
				className="absolute left-1.5 text-[0.8rem] text-accent leading-none opacity-0 transition-opacity duration-150 dark:opacity-100"
			>
				☀
			</span>
			<span
				aria-hidden="true"
				// 22px, not a scale step: the track's 42px of inside minus the
				// knob and the 2px it already sits in leaves exactly that, so the
				// gap either end matches at both ends of the travel.
				className="ml-0.5 size-4 rounded-full bg-accent transition-transform duration-150 dark:translate-x-[22px]"
			/>
		</button>
	);
}
