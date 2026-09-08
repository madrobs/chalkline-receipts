import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export function createStorage() {
  const baseUrl = process.env.STORAGE_URL;
  if (baseUrl) {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/objects`;
    return {
      async put({ key, body, contentType }) {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key, body, contentType }),
        });
        if (!res.ok) {
          throw new Error("failed to write receipt");
        }
      },
    };
  }

  const root = path.join(process.cwd(), "data");
  return {
    async put({ key, body }) {
      const dest = path.join(root, key);
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, body);
    },
  };
}
