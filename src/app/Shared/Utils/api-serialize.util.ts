/** Converts BigInt values so JSON request bodies can be sent via HttpClient. */
export function serializeForApi(value: unknown): unknown {
  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeForApi(item));
  }

  if (
    typeof value === 'object' &&
    !(value instanceof FormData) &&
    !(value instanceof File) &&
    !(value instanceof Blob) &&
    !(value instanceof Date)
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serializeForApi(item)])
    );
  }

  return value;
}
