import http from "node:http";
import { pathToFileURL } from "node:url";
import { createStorage } from "./storage.js";
import { storeReceipt } from "./storeReceipt.js";

const service = "receipts-api";

function log(level, msg, fields) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, service, ...fields }));
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export async function createReceiptHandler(storage, body) {
  if (!body?.id) {
    return { status: 400, body: { error: "id is required" } };
  }

  const receipt = {
    id: body.id,
    gym: "Chalkline Athletics",
    type: "drop-in",
    memberName: body.memberName,
    amountCents: body.amountCents,
    createdAt: body.createdAt ?? new Date().toISOString(),
  };

  log("info", "create receipt requested", { receiptId: receipt.id });

  try {
    await storeReceipt({ storage, receipt });
    log("info", "receipt saved", { receiptId: receipt.id });
    return { status: 201, body: { ok: true, id: receipt.id } };
  } catch {
    log("error", "receipt request failed", { receiptId: receipt.id, status: 500 });
    return { status: 500, body: { error: "Something went wrong" } };
  }
}

export function createServer(storage) {
  return http.createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/receipts") {
      let body;
      try {
        body = JSON.parse(await readBody(req));
      } catch {
        send(res, 400, { error: "invalid json" });
        return;
      }

      const result = await createReceiptHandler(storage, body);
      send(res, result.status, result.body);
      return;
    }

    send(res, 404, { error: "Not found" });
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  const server = createServer(createStorage());
  server.listen(port, () => {
    console.log(`listening on ${port}`);
  });
}
