export async function runDbQuery<T>(
  queryFn: () => Promise<T>,
  retries = 7,
  baseDelayMs = 500
): Promise<T> {
  let attempt = 0;

  const retryableCodes = new Set([
    "ETIMEDOUT",
    "CONNECT_TIMEOUT",
    "ECONNRESET",
    "ECONNREFUSED",
    "ENETUNREACH",
    "EHOSTUNREACH",
  ]);

  function extractErrorCode(value: unknown, depth = 0): string | undefined {
    if (depth > 5 || typeof value !== "object" || value === null) {
      return undefined;
    }

    const obj = value as Record<PropertyKey, unknown>;

    if (typeof obj.code === "string") {
      return obj.code;
    }

    if (typeof obj.message === "string") {
      const message = obj.message;
      if (message.includes("CONNECT_TIMEOUT")) return "CONNECT_TIMEOUT";
      if (message.includes("ETIMEDOUT")) return "ETIMEDOUT";
      if (message.includes("ECONNREFUSED")) return "ECONNREFUSED";
      if (message.includes("fetch failed")) return "FETCH_FAILED";
    }

    const cause = obj.cause as unknown;
    const nestedCode = extractErrorCode(cause, depth + 1);
    if (nestedCode) {
      return nestedCode;
    }

    for (const key of [
      ...Object.getOwnPropertyNames(obj),
      ...Object.getOwnPropertySymbols(obj),
    ]) {
      const nested = obj[key as keyof typeof obj];
      if (nested && typeof nested === "object") {
        const found = extractErrorCode(nested, depth + 1);
        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }

  while (true) {
    try {
      return await queryFn();
    } catch (error: unknown) {
      const errorCode = extractErrorCode(error);
      const isRetryable =
        errorCode === "FETCH_FAILED" ||
        (errorCode !== undefined && retryableCodes.has(errorCode));

      if (!isRetryable || attempt >= retries) {
        throw error;
      }

      attempt += 1;
      const exponentialDelay = Math.min(
        baseDelayMs * 2 ** (attempt - 1),
        4_000
      );
      const delayMs =
        exponentialDelay + Math.floor(Math.random() * Math.max(250, baseDelayMs));
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
