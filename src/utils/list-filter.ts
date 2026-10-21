/**
 * Row-level visibility (club approval, document visibility, membership
 * roster privacy) can't be expressed as a DB filter tied to the requester,
 * so `find` responses are filtered in memory after the fact. That means
 * `meta.pagination.total` — computed before the filter — has to be
 * recomputed too, or the frontend sees a count that doesn't match `data`.
 */
export async function filterPaginatedResponse<Item, Response extends { data: Item[]; meta: any }>(
  response: Response,
  predicate: (item: Item) => Promise<boolean>
): Promise<Response> {
  const visibleData: Item[] = [];
  for (const item of response.data) {
    if (await predicate(item)) {
      visibleData.push(item);
    }
  }

  return {
    ...response,
    data: visibleData,
    meta: {
      ...response.meta,
      pagination: { ...response.meta?.pagination, total: visibleData.length },
    },
  };
}
