/**
 * Where the page breaks fall, captured by `pnpm paginate` driving a real
 * browser over the built site — do not edit by hand. `AutoPaginate` validates
 * this against the blocks in hand and discards it when stale, at the cost of
 * one measuring pass.
 */
export const PAGINATION: Record<string, number[][]> = {};
