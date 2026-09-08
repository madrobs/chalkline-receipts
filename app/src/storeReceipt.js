/**
 * Persist a front-desk drop-in receipt.
 */
export async function storeReceipt({ storage, receipt }) {
  const key = `drop-ins/${receipt.id}.json`;

  try {
    await storage.put({
      key,
      body: JSON.stringify(receipt),
      contentType: "application/json",
    });
  } catch {
    throw new Error("failed to save receipt");
  }

  return { key };
}
