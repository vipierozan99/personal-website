import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cv")({
	component: Cv,
});

// Placeholder until the curriculum-vitae project is ported as this route; it
// exists now so the URL is final and the prerender handles more than one page.
function Cv() {
	return (
		<main className="flex min-h-screen flex-col items-start gap-4 p-8">
			<h1 className="font-serif text-3xl text-ink">Curriculum vitæ</h1>
			<p className="text-ink-2">
				Moving in soon. For now it lives at{" "}
				<a href="https://victor.pierozan.com/">victor.pierozan.com</a>.
			</p>
			<Link to="/" className="font-mono text-sm">
				← Back
			</Link>
		</main>
	);
}
