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
    let calls = 0;
    const storage = {
      put: async () => {
        calls += 1;
        throw new Error("nope");
      },
    };

    await assert.rejects(
      () => storeReceipt({ storage, receipt: { id: "rcpt_test" } }),
      { message: "failed to save receipt" },
    );
    assert.equal(calls, 1);
  });

  it("retries when storage is briefly unavailable", async () => {
    let calls = 0;
    const storage = {
      put: async () => {
        calls += 1;
        if (calls < 3) {
          const err = new Error("slow");
          err.code = "Throttled";
          throw err;
        }
      },
    };

    await storeReceipt({ storage, receipt: { id: "rcpt_test" } });
    assert.equal(calls, 3);
  });
});
