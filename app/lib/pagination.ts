/** Rows-per-page options for the inventory list (first is the default). */
export const PAGE_SIZES = [10, 25, 50] as const;

export function parsePageSize(value: unknown): number {
  const n = Number(value);
  return (PAGE_SIZES as readonly number[]).includes(n) ? n : PAGE_SIZES[0];
}
