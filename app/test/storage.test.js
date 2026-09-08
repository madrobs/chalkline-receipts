import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createStorage } from "../src/storage.js";

describe("createStorage", () => {
  const previousUrl = process.env.STORAGE_URL;
  const previousFetch = global.fetch;

  afterEach(() => {
    if (previousUrl === undefined) {
      delete process.env.STORAGE_URL;
    } else {
      process.env.STORAGE_URL = previousUrl;
    }
    global.fetch = previousFetch;
  });

  it("posts the receipt to the storage service", async () => {
    process.env.STORAGE_URL = "http://storage.internal";
    let called;
    global.fetch = async (url, init) => {
      called = { url, init };
      return { ok: true };
    };

    await createStorage().put({
      key: "drop-ins/rcpt_test.json",
      body: "{}",
      contentType: "application/json",
    });

    assert.equal(called.url, "http://storage.internal/objects");
    assert.equal(called.init.method, "POST");
    assert.equal(JSON.parse(called.init.body).key, "drop-ins/rcpt_test.json");
  });

  it("hides a failed write from the storage service", async () => {
    process.env.STORAGE_URL = "http://storage.internal";
    global.fetch = async () => ({ ok: false, status: 500 });

    await assert.rejects(
      () =>
        createStorage().put({
          key: "drop-ins/rcpt_test.json",
          body: "{}",
          contentType: "application/json",
        }),
      { message: "failed to write receipt" },
    );
  });
});
