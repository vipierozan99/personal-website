import { Link } from "@tanstack/react-router";
import { useLanguage } from "../../lib/lang";
import { useCopy } from "../../lib/useCopy";

const rowLink = "font-mono text-xs";

export function Elsewhere() {
  const { content, t } = useLanguage();
  const { person } = content.frontmatter;
  const { copied, copy } = useCopy(person.email);

  return (
    <section
      id="elsewhere"
      className="flex flex-wrap items-baseline gap-x-10 gap-y-4 border-accent-line border-t pt-6"
    >
      <span className="font-mono font-semibold text-accent text-tag uppercase tracking-banner">
        {t("elsewhere.title")}
      </span>
      <button
        type="button"
        onClick={copy}
        title={t("contact.copy")}
        className="cursor-pointer font-mono text-ink-3 text-xs transition-colors duration-150 hover:text-accent"
      >
        {copied ? t("contact.copied") : `⧉ ${person.email}`}
      </button>
      <a href={person.github.href} className={rowLink}>
        {person.github.label} ↗
      </a>
      <a href={person.paper} className={rowLink}>
        {t("elsewhere.paper")}
      </a>
      <Link to="/cv" className={rowLink}>
        {t("elsewhere.cvLink")}
      </Link>
      <div className="flex-1" />
      <span className="font-mono text-faint text-tag leading-prose">
        {t("elsewhere.colophon")}
      </span>
    </section>
  );
}
