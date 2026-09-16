import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createReceiptHandler, createServer } from "../src/server.js";

describe("createReceiptHandler", () => {
  it("rejects a receipt that has no id", async () => {
    let calls = 0;
    const storage = {
      put: async () => {
        calls += 1;
      },
    };

    const result = await createReceiptHandler(storage, { memberName: "Jordan Hale" });
    assert.equal(result.status, 400);
    assert.equal(calls, 0);
  });

  it("answers a health check", async () => {
    const server = createServer({ put: async () => {} });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();

    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { ok: true });
    } finally {
      await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    }
  });
});
