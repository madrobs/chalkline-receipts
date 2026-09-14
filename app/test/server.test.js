import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createReceiptHandler } from "../src/server.js";

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
});
