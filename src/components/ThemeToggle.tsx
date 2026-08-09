import { useT } from "../lib/lang";
import { useThemeToggle } from "../lib/theme";

export function ThemeToggle() {
	const t = useT();
	const toggle = useThemeToggle();
	return (
		<button
			type="button"
			onClick={toggle}
			title={t("theme.toggle")}
			className="flex cursor-pointer items-center gap-1.5 rounded-full border border-accent-line px-3 py-1 font-mono text-accent text-tag uppercase tracking-tag transition-colors duration-150 hover:border-accent"
		>
			<span className="text-xs dark:hidden" aria-hidden>
				☾
			</span>
			<span className="dark:hidden">{t("theme.dark")}</span>
			<span className="hidden text-xs dark:inline" aria-hidden>
				☀
			</span>
			<span className="hidden dark:inline">{t("theme.light")}</span>
		</button>
	);
}
