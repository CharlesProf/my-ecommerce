export async function runDbQuery<T>(
  queryFn: () => Promise<T>,
  retries = 2,
  baseDelayMs = 250
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await queryFn();
    } catch (error: unknown) {
      const err = error as { code?: string; cause?: { code?: string } };
      const isTimeout =
        err?.code === "ETIMEDOUT" || err?.cause?.code === "ETIMEDOUT";

      if (!isTimeout || attempt >= retries) {
        throw error;
      }

      attempt += 1;
      await new Promise((resolve) =>
        setTimeout(resolve, baseDelayMs * attempt)
      );
    }
  }
}
