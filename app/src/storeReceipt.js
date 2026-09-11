/**
 * Persist a front-desk drop-in receipt.
 */
const MAX_ATTEMPTS = 3;
const RETRYABLE = new Set(["Throttled", "Timeout", "Unavailable"]);

function isRetryable(err) {
  return RETRYABLE.has(err.code ?? err.name);
}

export async function storeReceipt({ storage, receipt }) {
  const key = `drop-ins/${receipt.id}.json`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await storage.put({
        key,
        body: JSON.stringify(receipt),
        contentType: "application/json",
      });
      return { key };
    } catch (err) {
      if (!isRetryable(err) || attempt === MAX_ATTEMPTS) {
        throw new Error("failed to save receipt");
      }
    }
  }
}
