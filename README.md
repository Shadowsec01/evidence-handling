# Digital Evidence Integrity Platform (MVP)
### Track H1 · ICSC Hackathon — Phase 1 Build

A prototype that proves one core idea: **when evidence is collected, we hash it and lock that
hash as a trusted baseline (H₀). Every later check recomputes the hash and compares it to H₀ —
never to "whatever is currently stored." If it doesn't match, we stop and record it instead of
continuing silently.**

---

## ⚠️ One requirement before you start: MongoDB

This app needs a MongoDB server running locally (or a MongoDB Atlas connection string).

**Option A — install MongoDB locally (recommended for the demo):**
- Download/install MongoDB Community Server for your OS: https://www.mongodb.com/try/download/community
- Start it (it typically listens on `mongodb://127.0.0.1:27017` by default — the `.env` files in this project are already set to that address, so no changes needed if you use the default install)

**Option B — use MongoDB Atlas (free tier, no local install):**
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Copy your connection string
- Paste it into `backend/.env` as `MONGO_URI=...`

Everything else below assumes MongoDB is reachable.

---

## Quick start

```bash
# 1. Unzip the project and cd into it
cd evidence-platform

# 2. Install dependencies for both backend and frontend
npm run install:all

# 3. Seed the 3 demo accounts (one per role)
npm run seed

# 4. Run both backend and frontend together
npm run dev
```

That's it. This will:
- Start the backend API on **http://localhost:5000**
- Start the frontend on **http://localhost:5173**

Open **http://localhost:5173** in your browser.

> If `npm run dev` at the root doesn't work for any reason, run the two halves in separate
> terminals instead — see "Running manually" below.

---

## Demo login accounts

Created by `npm run seed`. Password is the same for all three:

| Role | Email | Password |
|---|---|---|
| Field Officer | `field@demo.com` | `Passw0rd!` |
| Investigator | `investigator@demo.com` | `Passw0rd!` |
| Officer Head | `head@demo.com` | `Passw0rd!` |

The login screen has one-click buttons to autofill each of these.

---

## Running manually (if you don't want the root convenience scripts)

**Terminal 1 — backend:**
```bash
cd backend
npm install
npm run seed     # only needs to be run once
npm run dev
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Project structure

```text
evidence-platform/
├── backend/                 Node.js + Express + MongoDB (Mongoose) API
│   ├── src/
│   │   ├── models/          Mongoose schemas (Case, EvidenceItem, Baseline, AuditEvent, ...)
│   │   ├── routes/          Express route definitions
│   │   ├── controllers/     Request handlers — the core integrity loop lives in evidence.controller.js
│   │   ├── middleware/      JWT auth, role checks, file upload (multer)
│   │   ├── utils/           SHA-256 hashing + the hash-chained audit logger
│   │   ├── seed.js          Creates the 3 demo accounts
│   │   ├── app.js           Express app + route mounting
│   │   └── server.js        Entry point — connects Mongo, starts the server
│   ├── uploads/              Where uploaded evidence files are stored locally
│   ├── .env                  Already configured with local defaults
│   └── package.json
├── frontend/                 React (Vite) app, one app with 3 role-based tabs
│   ├── src/
│   │   ├── views/             FieldCollectionView, InvestigatorView, OfficerHeadView
│   │   ├── components/         CaseForm, EvidenceUpload, VerifyButton, TamperDemoButton, AuditTrailTable, Login
│   │   ├── api/client.js       Axios instance, attaches JWT automatically
│   │   ├── auth/AuthContext.jsx Login state, token storage
│   │   └── App.jsx             Tab switcher, gated by role
│   ├── .env                    Points to http://localhost:5000/api
│   └── package.json
├── package.json               Root convenience scripts (install:all, seed, dev)
└── README.md                  This file
```

---

## What each role can do (MVP scope)

- **Field Officer** — create a case, upload evidence files (any type, including images). On
  upload, the backend hashes every file, builds a manifest, and locks the H₀ baseline.
- **Investigator** — pick a case, pick an evidence item, click **Verify Integrity** to recompute
  the hash and compare against H₀. There's also a clearly-labeled **Demo: Simulate Tampering**
  button so you can show a mismatch live.
- **Officer Head** — see all cases, all incidents (hash mismatches), and the full hash-chained
  audit trail for any evidence item.

---

## Suggested demo script (~2 minutes)

1. Log in as **Field Officer** → create a case → upload 2–3 mixed files (e.g. a text log + an
   image) as one piece of evidence → point out the baseline hash that gets established
2. Log in as **Investigator** → select that evidence → click **Verify Integrity** → show **PASS**
3. Click **Demo: Simulate Tampering**
4. Click **Verify Integrity** again → show **MISMATCH**, and that an Incident was created
5. Log in as **Officer Head** → show the Incident on the dashboard, and the full audit trail
   timeline for that evidence item (chain-verified, not just a status flag)

Close with: *"We never trust the current copy — we verify it against a locked baseline every
time, and we never fail silently."*

---

## What's intentionally NOT in this MVP

Said out loud to judges, not hidden — these are designed into the data model but out of scope
for the two-day build:

- Custody transfer / assignment handshakes between investigator and officer head
- Offline-first sync and local event queue
- Encrypted local vault for evidence at rest
- Chunk-level hashing (this build hashes whole files + the manifest, not individual chunks)

---

## Troubleshooting

- **Backend won't start / "failed to start" in the console** — MongoDB isn't reachable. Confirm
  it's running locally, or that `MONGO_URI` in `backend/.env` points to a valid Atlas cluster.
- **Login fails for all demo accounts** — you likely skipped `npm run seed`. Run it once from the
  root (`npm run seed`) or inside `backend/` (`npm run seed`).
- **File upload fails** — check the file size (25MB limit per file by default, adjustable in
  `backend/src/middleware/upload.js`), and that the `backend/uploads/` folder is writable.
- **CORS or "Network Error" in the browser console** — confirm the backend is actually running on
  port 5000 and that `frontend/.env`'s `VITE_API_URL` matches.
