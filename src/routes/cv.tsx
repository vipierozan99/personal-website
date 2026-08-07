import { createFileRoute } from "@tanstack/react-router";

// The component lives in cv.lazy.tsx so the paginator, sheets and CV blocks
// stay out of the home bundle; search validation is inherited from __root.
export const Route = createFileRoute("/cv")({});
