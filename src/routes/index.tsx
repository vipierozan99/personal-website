import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<main className="p-8">
			<h1 className="font-serif text-4xl text-ink">Victor Pierozan</h1>
			<p className="font-serif italic text-accent">
				Backend and systems engineer in Berlin.
			</p>
		</main>
	);
}
