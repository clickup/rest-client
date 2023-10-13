/**
 * Keeps calling a function with an updating cursor, and depaginates all the
 * results until the cursor returned is null or undefined.
 *
 * On each call, the inner function needs to return an array with two elements:
 * 1. Array or results, which could be empty, but not null or undefined.
 * 2. A new cursor.
 */
export default async function* depaginate<TItem, TCursor = string>(
  readFunc: (
    cursor: TCursor | undefined
  ) => Promise<[TItem[], TCursor | null | undefined]>
): AsyncGenerator<TItem, void, undefined> {
  let prevCursor: TCursor | null | undefined = undefined;
  let cursor: TCursor | null | undefined = undefined;
  for (;;) {
    let items: TItem[];
    [items, cursor] = await readFunc(cursor === null ? undefined : cursor);
    yield* items;

    if (cursor === null || cursor === undefined) {
      break;
    }

    if (JSON.stringify(prevCursor) === JSON.stringify(cursor)) {
      throw Error(
        "Depagination got stuck: prevCursor=" +
          JSON.stringify(prevCursor) +
          ", cursor=" +
          JSON.stringify(cursor) +
          " (they must differ)"
      );
    }

    prevCursor = cursor;
  }
}
