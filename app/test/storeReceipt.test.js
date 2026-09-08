import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { storeReceipt } from "../src/storeReceipt.js";

describe("storeReceipt", () => {
  it("puts JSON under drop-ins/", async () => {
    const calls = [];
    const storage = {
      put: async (input) => {
        calls.push(input);
      },
    };

    await storeReceipt({
      storage,
      receipt: { id: "rcpt_test", gym: "Chalkline Athletics" },
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].key, "drop-ins/rcpt_test.json");
    assert.equal(JSON.parse(calls[0].body).id, "rcpt_test");
  });

  it("hides storage failures", async () => {
    const storage = {
      put: async () => {
        throw new Error("nope");
      },
    };

    await assert.rejects(
      () => storeReceipt({ storage, receipt: { id: "rcpt_test" } }),
      { message: "failed to save receipt" },
    );
  });
});
