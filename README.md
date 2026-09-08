# chalkline-receipts

`receipts-api` for **Chalkline Athletics** — a (fictional) gym that sells drop-in day passes at the front desk.

When a member pays, this service asks the storage service to keep a JSON receipt so the front desk can reprint it and accounting can export the day.

```
POST /receipts  →  storage service  →  drop-ins/{id}.json
```

The storage service is a separate API. It is not in this repo.

## Workshop

This is the app you run. On a Mac, install the tools below, clone this repo, start the server, and send the `curl`. You do not need cloud credentials, and you do not install or run Terraform.

With `STORAGE_URL` unset, receipts are written on your laptop under `app/data/drop-ins/`. That is enough for the workshop. If a facilitator gives you a storage URL, start the server with that variable set. Use only the URL they provide.

## Setup (Mac)

Check what you already have:

```bash
git --version
node --version
```

If either command is missing, install [Homebrew](https://brew.sh/), then git and Node:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the PATH instructions Homebrew prints, then:

```bash
brew install git node
```

Node 22 or newer is what this workshop uses. This app has no npm dependencies, so you do not run `npm install`.

## Run

```bash
git clone https://github.com/madrobs/chalkline-receipts.git
cd chalkline-receipts/app
npm start
```

In a second terminal:

```bash
curl -s -X POST localhost:3000/receipts \
  -H 'content-type: application/json' \
  -d '{"id":"rcpt_1","memberName":"Jordan Hale","amountCents":2500}'
```

A successful local save returns `{"ok":true,"id":"rcpt_1"}` and writes `app/data/drop-ins/rcpt_1.json`.

`GET /health` returns `{ "ok": true }`.

To send receipts to a storage service instead of local files:

```bash
STORAGE_URL=https://storage.example.com npm start
```

`STORAGE_URL` is the base URL. The app calls `/objects` on it.

## Layout

- `app/` — Node service that takes receipt requests
- `logs/` — sample production logs
