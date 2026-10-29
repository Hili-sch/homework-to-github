# Project Plan: Fitness Tracker Dashboard (Auth & RBAC)

- **Project:** `project-2`, a gym training tracker
- **Source of truth:** [`SPEC.md`](SPEC.md). Never edit it to fit the code; it changes only when the requirements change. If this plan and the spec disagree, the spec wins: fix the plan, not the spec.
- **Stack:** Node.js v20+, Express, `cors`, `bcryptjs`, `jsonwebtoken`, Vanilla HTML/CSS/JS, `node:test` + `node:assert`
- **Deliverables (§12):** `client/`, `server/`, `README.md`, `AI-LOG.md`, `TESTS-LOG.md`
- **Plan version:** 1.1, 2026-10-09
- **Changes in 1.1:** Task 3.2 step 3 now states the abstract-method contract plainly. The new **Include calorie burn** option for Aerobic exercises (SPEC §3.5) is added to the affected tasks and to the Appendix.

This document turns the spec into an ordered build plan. Work through it stage by stage and task by task. Each task fits in one sitting and one commit, and leaves the project working and tested.

**Contents:** [Overview](#overview) · [How to Use This Plan](#how-to-use-this-plan) · [Definition of Done](#definition-of-done) · [Roadmap](#roadmap) · [Spec Clarifications](#spec-clarifications-decision-register) · Stages 0–13 · [Appendix: Acceptance Checklist Map](#appendix-acceptance-checklist-map-14)

---

## Overview

**What we're building:** a single-page gym training tracker, served by an Express API at `http://localhost:3000`. Users register and log in (bcrypt + JWT). They log **Power** and **Aerobic** sessions against a shared exercise catalog and browse them as filterable cards with stats and insights. Admins and superadmins can turn on a calorie-burn estimate for individual Aerobic exercises (§3.5). Three roles (`superadmin`, `admin`, `user`) are enforced on every route and every UI control (§2.2).

```text
Browser: client/ (index.html · style.css · script.js)
   │  fetch + "Authorization: Bearer <JWT>"   (token held in a JS variable only)
   ▼
Express: server.js → routes/ → middlewares/ (auth · roles · ownership · validation)
   │  class instances in memory: models/ (User · Training · BaseSession · AerobicSession · PowerSession)
   ▼
JSON files: server/db/ (users.json · trainings.json · options.json), written via writeDB()
```

**Scope at a glance**

| Item | Count | Spec |
|---|---|---|
| Roles | 3 | §2 |
| Model classes | 5: `User`, `Training`, `BaseSession`, `AerobicSession`, `PowerSession` | §3 |
| Calorie functions | 7, plus the constant `REFERENCE_BODY_WEIGHT_KG` | §3.4 |
| Middleware files / exports | 4 / 11 | §6 |
| Routers / endpoints | 5 / 15 | §8 |
| Client pure functions | 9 | §11 |
| Automated test groups | 8 | §13 |
| Manual acceptance checks | 37 | §14 |

**Prerequisites**
- Node.js v20 or newer (`node -v`) and npm.
- Git, working inside the `homework-to-github` repository.
- A modern browser with DevTools (the device toolbar is used for responsive checks).
- Optional: an HTTP client for manual API checks (`curl` or PowerShell `Invoke-RestMethod`).

---

## How to Use This Plan

**Order.** Stages are sequential: each builds on the one before it and ends with everything green. Tasks inside a stage run in order. Stage 9 (client pure logic) depends only on the constants from Stage 5, so you can bring it forward if you want a change of pace.

**Task format.** Every task uses the same blocks:

| Block | Meaning |
|---|---|
| **Files · Spec** | Files created (new) or changed (edit), and the SPEC.md sections the task implements |
| **Steps** | What to do, in order |
| **Tests** | What to add to `server/tests/system.test.js`, and under which §13 group |
| **Watch out** | Known traps, listed only where they exist |
| **Done when** | Checkboxes. The task is finished when every box is ticked |

**Tests live with the code.** §13 requires a test for every function: *"If you add a function, you add a test for it."* Each task therefore adds its own tests in the same commit. There is no separate testing stage. The test file is organized into the eight §13 groups from Task 1.6 onward.

**One task = one commit.** Stage 0 ends with one baseline commit. From Stage 1 on, work on the `project-2` branch and commit when all of a task's boxes are ticked:

```bash
git commit -m "[3.2] Add BaseSession with its own sessionId counter"
```

Open a pull request into `master` after Stage 13.

**Working with an AI assistant.** SPEC.md is written as an AI system prompt, and §12 requires an `AI-LOG.md` of the prompts used. Give the assistant one task per prompt:

```text
Read SPEC.md (source of truth, do not modify it) and project.md (build plan).
Implement Task <X.Y>: <title>, exactly as described in project.md.
Follow every SPEC.md rule. Keep spec names exactly as written. Put explanations in code comments only.
Add the task's tests to server/tests/system.test.js (<group> group) and run: cd server && npm run test
Report: files changed, the test summary, and any spec gap you resolved.
```

Then log the prompt and its result in `AI-LOG.md` (Task 0.2), and review the generated code before committing.

**Stage gate.** Every stage from Stage 1 on ends with the same routine:
1. `cd server && npm run test` exits with code 0.
2. `TESTS-LOG.md` gets a new *Automated Test Runs* entry, and any §14 checks the stage verified are updated.
3. `AI-LOG.md` contains every prompt and decision from the stage.
4. Commit the log updates: `git commit -m "[3] Stage 3 gate: tests green, logs updated"`.

**Never edit SPEC.md to fit the code.** It changes only when the requirements change (as in plan version 1.1). SPEC.md says: *"If something is not covered here, choose the simplest option that does not break any rule below, and record that decision in AI-LOG.md."* The [Spec Clarifications](#spec-clarifications-decision-register) below already settle the gaps found while planning. When you apply one, copy its ID (for example `D-09`) into the AI-LOG Decision Log. Number new decisions from `D-19`.

---

## Definition of Done

Every task must meet all of these, in addition to its own **Done when** list:

- Names match SPEC.md exactly: classes, fields, functions, middleware, routes and files (§11).
- Only the allowed tech is used (§10): no frameworks, no client-side libraries, no third-party test libraries.
- No `localStorage`, `sessionStorage`, cookies, `alert()` or `confirm()` (§7, §9, §10).
- Explanations are code comments, not separate prose (§11).
- Server code uses CommonJS, `const`/`let` (never `var`) and `async/await`. Every route handler is wrapped in `try/catch` and returns `500 { error }` on unexpected failures (§11).
- Every new function and class method is exported (server) or listed in `module.exports` (client pure logic), and has at least one test (§13).
- Every error response is `{ "error": "<message>" }`, and no response contains `password` (§6, §8).
- `cd server && npm run test` exits with code 0.
- The prompt used, if any, and every decision made are recorded in `AI-LOG.md`.

---

## Roadmap

| Stage | Theme | Main output | Spec |
|:---:|---|---|---|
| [0](#stage-0-project-tracking-files) | Project tracking files | `README.md`, `AI-LOG.md`, `TESTS-LOG.md` | §12, §14 |
| [1](#stage-1-scaffolding--test-harness) | Scaffolding & test harness | Folder tree, `package.json`, `server.js` skeleton, seed DB, test harness | §5, §10, §12, §13 |
| [2](#stage-2-calorie-engine) | Calorie engine | `utils/calories.js` | §3.4 |
| [3](#stage-3-domain-models) | Domain models | `models/Training.js`, `models/Session.js`, `models/User.js` | §3 |
| [4](#stage-4-persistence-layer) | Persistence layer | `utils/db.js` | §3.3, §5 |
| [5](#stage-5-input-validation) | Input validation | `middlewares/validation/validate.js` | §4 |
| [6](#stage-6-authentication--access-middlewares) | Authentication & access middlewares | `authenticate.js`, `authorize.js`, `ownership.js` | §6 |
| [7](#stage-7-rest-api) | REST API | `routes/*.routes.js` (5 routers, 15 endpoints) | §8 |
| [8](#stage-8-rbac-verification--hardening) | RBAC verification & hardening | RBAC test group, security review | §2.2, §6, §13 |
| [9](#stage-9-client-pure-logic) | Client pure logic | Pure functions in `client/script.js` | §11, §13 |
| [10](#stage-10-client-shell--authentication-ui) | Client shell & authentication UI | `index.html`, `style.css`, auth flow, token lifecycle | §7, §9, §10 |
| [11](#stage-11-sessions-dashboard) | Sessions dashboard | Add, list, edit, delete, filter, sort, stats, insights | §9 |
| [12](#stage-12-catalog--administration-ui) | Catalog & administration UI | Exercise form (muscle-group flow, calorie option), user management | §2.2, §3.5, §9 |
| [13](#stage-13-qa--delivery) | QA & delivery | Audits, manual checklist, final docs, pull request | §12, §13, §14 |

---

## Spec Clarifications (Decision Register)

SPEC.md doesn't answer every question you'll run into. These are the recommended answers, each chosen as the simplest option that keeps every spec rule. They are defaults, not new requirements. If you choose differently, log your own choice instead. Either way, record the decision in the AI-LOG Decision Log when the task that needs it is done. None of them change SPEC.md.

| ID | Topic | Recommended decision | Spec | Task |
|---|---|---|---|---|
| D-01 | Test-log file name | Use `TESTS-LOG.md` (plural), exactly as §12 and §14 spell it. | §11, §12 | 0.3 |
| D-02 | Planning document | `project.md` sits next to `SPEC.md` as a planning document. It isn't part of the §12 code tree and no code depends on it. | §12 | 0.2 |
| D-03 | Temp folder for tests | Create it with `fs.mkdtemp(path.join(os.tmpdir(), 'fitness-'))`. Passing `os.tmpdir()` alone appends random characters to the temp path itself, which creates a sibling of the temp directory. | §13 | 1.6 |
| D-04 | Errors outside the routes | Unknown `/api/*` paths return `404 { error }`. Malformed JSON bodies return `400 { error }` through a final error-handling middleware, so every error body keeps the §6 shape. | §6 | 1.3 |
| D-05 | Persistence model | `loadAll()` runs once at startup (and in the test `before()`), turns the JSON into class instances, and keeps them in memory. Every change is written straight through with `writeDB()`, so IDs never repeat while the server runs. | §3.3, §5 | 4.3 |
| D-06 | Catalog ID reseed | Reseed `Training.idCounter` from the highest catalog `id` or session `trainingId`, whichever is larger. A deleted exercise's id then never goes to a new exercise. | §3.3 | 4.3 |
| D-07 | Stored derived values | Each session's `toJSON()` adds `effortScore` and `calories` (§3.5). Both may appear in `users.json`, but they are ignored on load and always recomputed. | §3 | 3.3 |
| D-08 | 400 vs 403 vs 404 vs 409 | Validation middlewares return `400` for broken §4 rules. When they need a stored record to validate against (the exercise on `PUT /api/trainings/:id`, the session on `PUT …/sessions/:sessionId`) and it doesn't exist, they return `404`. Duplicates (`409`) and permission rules that depend on the body (an admin creating an `admin` → `403`) belong in the route handlers. | §4, §6, §8 | 5.x, 7.x |
| D-09 | `role` in the register body | Ignore it. Registration always creates `role: 'user'`. | §2.2 | 7.1 |
| D-10 | Login lookup | Match `name` trimmed and case-insensitively, since names are unique that way. A missing name or password gets the same generic `401` as a wrong password. | §4, §6 | 7.1 |
| D-11 | Unused incline/resistance | `undefined`, `null` and `''` are stored as `null`. Any other value in a field the activity doesn't use → `400`. | §4 | 5.4 |
| D-12 | Session validation context | POST: type and activity come from the catalog item named by `trainingId` (missing or unknown → `400`). PUT: they come from the stored session (unknown → `404`). A PUT carries `date` plus all type fields. A `type`, `activity` or `includeCalories` in a PUT body must equal the stored value or be absent (otherwise `400`). | §4, §8 | 5.4 |
| D-13 | Session `muscleGroup` | On POST, a missing value defaults to the catalog item's `muscleGroup`. Valid values are anything in the options list, the catalog item's current `muscleGroup`, and on PUT the session's own current value, so older sessions stay editable after their exercise is edited or deleted. | §3.2, §4 | 5.4, 7.5 |
| D-14 | 403 before 404 | Middlewares run in the §8 order, so access is checked before existence. A regular user asking for another user's id gets `403` even if that id doesn't exist. Admins and superadmins get `404`. | §8 | 6.3, 7.4 |
| D-15 | "Not in the future" | Compare the `YYYY-MM-DD` string with the server's local date, not UTC. Impossible dates such as `2026-02-30` → `400`. | §4 | 5.1 |
| D-16 | JWT helpers and stale tokens | `signToken()` lives in `authenticate.js` next to verification, so the secret and the 2h expiry are defined in one place. `authenticateToken` also returns `401` when the token's user no longer exists or the stored name differs (a deleted user, or a reused id). | §6 | 6.1 |
| D-17 | Users panel | §9 doesn't describe one, but the §2.2 row "Delete a user" needs a place in the UI. Add a minimal users list for admins and superadmins. Only superadmins get a Delete button, and it never appears on their own row. | §2.2, §9 | 12.5 |
| D-18 | Insight fallbacks | Each insight has its own friendly fallback sentence, so `buildInsights` always returns at least 4 sentences, even with no data. | §9, §13 | 9.5 |

---

## Stage 0: Project Tracking Files

**Goal:** create the three tracking documents §12 requires before writing any code, so every later task has a place to log prompts, decisions and test results. All three live in the project root, next to `SPEC.md`.

### Task 0.1: Create `README.md`

**Files:** `README.md` (new) · **Spec:** §3.3, §12

**Steps**
1. Create `README.md` in the project root.
2. Add these sections:
   - **Title and summary:** a Gym Training Tracker built with Vanilla JS and Express, with password login and role-based access control.
   - **Tech stack:** the allowed list from §10.
   - **Prerequisites:** Node.js v20+.
   - **Setup & run:** `cd server`, `npm install`, `npm start`, then open `http://localhost:3000`.
   - **Running tests:** `cd server && npm run test`.
   - **Roles & default credentials** (table from §2.1): Super Admin `Hilli Schlesinger` / `1234`, Admin `Staff Admin` / `admin123`. Regular users are created through Register.
   - **Effort score note** (§3.3): the score is unitless and rounded to 1 decimal. Aerobic sessions score estimated kcal (ACSM equations, 70 kg reference body weight). Power sessions score kg-volume (`sets × reps × weight`). The two units aren't comparable, and this is accepted by design.
   - **Project structure:** the §12 tree.
   - **Known limitations** (§1, §7): a page refresh logs the user out. There is no password reset, email or file upload.
   - **Project documents:** links to `SPEC.md`, `project.md`, `AI-LOG.md` and `TESTS-LOG.md`.

**Done when**
- [ ] The three items §12 requires are present: setup commands (`npm install`, `npm start`, `npm run test`), roles & default credentials, and the effort-score note.
- [ ] Every section that depends on later work is marked `TODO (Task 13.5)`.

### Task 0.2: Create `AI-LOG.md`

**Files:** `AI-LOG.md` (new) · **Spec:** §1 (preamble), §12

**Steps**
1. Create `AI-LOG.md` with a short header: project name, purpose (§12: "prompts used and decisions the AI made"), and the AI tools and models used.
2. Add a **Prompt Log** section with one entry per prompt:
   ```markdown
   ### P-001 · 2026-10-06 · Planning
   - **Prompt:** (verbatim, or a faithful summary for a very long prompt)
   - **Result:** what was produced or changed
   - **Files:** project.md
   - **Decisions:** D-01, D-02
   - **Review:** accepted as is / changed by hand (what and why)
   ```
3. Add a **Decision Log** section as a table: `| ID | Date | Task | Question / spec gap | Decision | Spec ref |`.
4. Log the first entries: `P-001` (the prompt that produced `project.md`), `D-01` and `D-02`.

**Done when**
- [ ] Both sections exist with the templates above.
- [ ] `P-001`, `D-01` and `D-02` are logged.

### Task 0.3: Create `TESTS-LOG.md`

**Files:** `TESTS-LOG.md` (new) · **Spec:** §12, §14

**Steps**
1. Create `TESTS-LOG.md` with a header stating its purpose (§12: "npm run test output + manual checklist results").
2. Add an **Automated Test Runs** section with one entry per stage gate:
   ```markdown
   ### Run 01 · <date> · Stage 1 gate
   - **Command:** `cd server && npm run test`
   - **Result:** tests <n> · pass <n> · fail 0 · exit code 0
   - **Summary output:** (paste the closing summary lines printed by node:test)
   ```
3. Add a **Manual Acceptance Checklist (§14)** section: one table row for each of the 37 checks in the [Appendix](#appendix-acceptance-checklist-map-14), using its IDs. Columns: `| ID | Check | Result | Date | Evidence / notes |`. Set every Result to `Pending`.
4. Add a **Defects** section for failures found during manual testing: `| ID | Found in task | Description | Fixed in task |`.

**Done when**
- [ ] All 37 checks are listed with their IDs and `Pending` status.
- [ ] The automated-run template is ready for Run 01 (Task 1.6).

### Task 0.4: Complete Stage 0 (branch and baseline commit)

**Files:** none (git only) · **Spec:** none

**Steps**
1. Create the working branch: `git checkout -b project-2`.
2. Review the four documents (`project.md`, `README.md`, `AI-LOG.md`, `TESTS-LOG.md`) for typos and broken links.
3. Commit them together with the unchanged `SPEC.md`:
   ```bash
   git add SPEC.md project.md README.md AI-LOG.md TESTS-LOG.md
   git commit -m "[0] Add spec, project plan and tracking files"
   ```

**Done when**
- [ ] Branch `project-2` exists and the working tree is clean.

**Stage 0 gate:** the three tracking files exist and are committed. From now on every task updates `AI-LOG.md`, and every stage gate updates `TESTS-LOG.md`.

---

## Stage 1: Scaffolding & Test Harness

**Goal:** a walking skeleton. Express serves the client at `http://localhost:3000`, and `npm run test` runs an isolated, green smoke test.

### Task 1.1: Create the folder structure

**Files:** directories only · **Spec:** §12

**Steps**
1. Create the §12 directories:
   ```text
   client/
   server/db/   server/models/   server/utils/   server/routes/   server/tests/
   server/middlewares/auth/   server/middlewares/roles/
   server/middlewares/ownership/   server/middlewares/validation/
   ```
2. Each file is created later by the task that owns it. Never add files outside the §12 tree: no extra helper modules, and no `.env` file (`dotenv` isn't on the allowed tech list).

**Watch out:** Git doesn't track empty folders. Each folder enters the repository with its first file.

**Done when**
- [ ] The directory tree matches §12.

### Task 1.2: Initialize `server/package.json`

**Files:** `server/package.json`, `server/package-lock.json` (new) · **Spec:** §10, §12

**Steps**
1. Run `npm init -y` inside `server/`.
2. Edit `package.json`: set `"main": "server.js"`, add `"engines": { "node": ">=20" }`, and keep exactly these scripts:
   ```json
   "scripts": {
     "start": "node server.js",
     "test": "node --test tests/system.test.js"
   }
   ```
3. Install the four allowed runtime dependencies: `npm install express cors bcryptjs jsonwebtoken`. Add no dev dependencies: no nodemon, no test libraries.
4. Confirm that `node_modules/` is ignored (the repository's root `.gitignore` already lists it) and that `package-lock.json` will be committed.

**Watch out:** `npm install express` installs Express 5. In Express 5, `req.body` is `undefined` when a request has no JSON body, so always read `req.body ?? {}`.

**Done when**
- [ ] `package.json` has exactly the two scripts and the four dependencies.
- [ ] `package-lock.json` exists.

### Task 1.3: Create the `server.js` skeleton

**Files:** `server/server.js` (new) · **Spec:** §6, §10

**Steps**
1. Create the app and add the global middlewares in this order: `cors()`, `express.json()`, `express.static(path.join(__dirname, '..', 'client'))`.
2. Add a commented placeholder where Stage 7 will mount the routers.
3. After that placeholder, add: `app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))`.
4. Add a final error-handling middleware `(err, req, res, next)`. Malformed JSON (`err.type === 'entity.parse.failed'`) → `400 { error }`. Anything else → `500 { error }` (D-04).
5. Export the app and listen only when the file is run directly:
   ```js
   module.exports = { app };

   if (require.main === module) {
     app.listen(3000, () => console.log('Server running at http://localhost:3000'));
   }
   ```
6. Keep `server.js` to wiring only. Business logic goes elsewhere (§10).

**Done when**
- [ ] `npm start` serves the client at `http://localhost:3000`.
- [ ] `require('./server.js')` doesn't open a port.
- [ ] An unknown `/api/...` path returns `404 { error }`, and malformed JSON returns `400 { error }`.

### Task 1.4: Create the client placeholders

**Files:** `client/index.html`, `client/style.css`, `client/script.js` (new) · **Spec:** §9, §10, §11

**Steps**
1. `index.html`: HTML5 boilerplate with `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<link rel="stylesheet" href="style.css">`, `<script src="script.js" defer></script>`, and empty `<header>` and `<main>` landmarks.
2. `style.css`: a small reset and the utility class `.hidden { display: none; }` (§9).
3. `script.js`: three commented regions, in this order:
   ```js
   // 1) Constants and pure logic: no DOM access, tested from Node

   // 2) DOM layer: runs in the browser only
   if (typeof document !== 'undefined') {
     // event listeners, rendering, fetch calls
   }

   // 3) Node export for the test suite
   if (typeof module !== 'undefined') module.exports = { /* pure functions and constants */ };
   ```

**Done when**
- [ ] `node -e "require('./client/script.js')"`, run from the project root, finishes without errors.
- [ ] The page loads at `http://localhost:3000` with no console errors.

### Task 1.5: Create the seed database files

**Files:** `server/db/options.json`, `server/db/trainings.json`, `server/db/users.json` (new) · **Spec:** §2.1, §3.2, §3.5, §5

**Steps**
1. `options.json`: exactly `{ "muscleGroups": ["chest", "back", "legs", "shoulders", "arms", "core"] }`.
2. `trainings.json`: at least 3 Power items and one Aerobic item per activity (`running`, `walking`, `cycling`, `elliptical`, `rowing`, `other`), so at least 9 items with sequential ids. Power items have a `muscleGroup` from the list, `activity: null` and `includeCalories: false`. Aerobic items have an `activity`, `muscleGroup: null` and an `includeCalories` flag. Turn the flag on for at least one Aerobic item so the calorie option shows on first run (§3.5). Names are unique per type. Example items:
   ```json
   { "id": 1, "type": "Power", "name": "Bench Press", "activity": null, "muscleGroup": "chest", "includeCalories": false }
   { "id": 4, "type": "Aerobic", "name": "Treadmill Run", "activity": "running", "muscleGroup": null, "includeCalories": true }
   ```
3. `users.json`: the two §2.1 seed users with **plaintext** passwords, which are hashed on the first start (§5, Task 4.2). Example users:
   ```json
   { "id": 1, "name": "Hilli Schlesinger", "tel": "050-1234567", "role": "superadmin", "password": "1234", "sessions": [] }
   { "id": 2, "name": "Staff Admin", "tel": "052-7654321", "role": "admin", "password": "admin123", "sessions": [] }
   ```
   Don't seed regular users. They come from registration (§2.1).
4. Optional: give the seed users a few past-dated sample sessions so the dashboard isn't empty on first run. Use the §8 session shape (`sessionId`, `trainingId`, `type`, `name`, `activity`, `includeCalories`, `date`, plus the type fields). Tests must never depend on these sessions.

**Done when**
- [ ] All three files parse as valid JSON.
- [ ] The catalog has at least 3 Power items and one Aerobic item per activity, and the options list holds exactly the six built-in values.
- [ ] Both seed phone numbers match `/^05\d-?\d{7}$/`.

### Task 1.6: Build the test harness

**Files:** `server/tests/system.test.js` (new) · **Spec:** §13

**Steps**
1. Import `describe`, `it`, `before` and `after` from `node:test`, `assert` from `node:assert/strict`, and `fs/promises`, `os` and `path`.
2. In `before()`:
   1. Create a temp folder with `fs.mkdtemp(path.join(os.tmpdir(), 'fitness-'))` (D-03).
   2. Copy every `db/*.json` file into it.
   3. Set `process.env.DB_DIR` to the temp folder, and `process.env.JWT_SECRET` to a test value.
   4. Only then `require('../server.js')`. The require must happen inside `before()`, after the environment variables are set.
   5. Start `server = app.listen(0)` and build `baseUrl` from `server.address().port`.
3. Add helpers that later stages reuse:
   - `api(method, path, { token, body })`: calls the global `fetch`, sends and parses JSON, and returns `{ status, body }` (`body` is `null` for a `204`).
   - `assertNoPassword(value)`: walks any JSON value and fails if a `password` key appears at any depth (§13).
4. In `after()`: close the server, then run `fs.rm(tmpDir, { recursive: true, force: true })`.
5. Create the eight §13 groups as `describe` blocks, in this order: Models, Calories, DB utils, Validation, Middlewares, API routes, RBAC, Client logic.
6. Add smoke tests under API routes: `GET /` → `200` with HTML, and `GET /api/does-not-exist` → `404 { error }`.

**Watch out:** if the test process hangs after the last test, call `server.closeAllConnections()` before `server.close()`. `fetch` keeps connections alive.

**Done when**
- [ ] `npm run test` exits with code 0.
- [ ] After a run, `git status` shows no changes under `server/db/`, and the temp folder is gone.

**Stage 1 gate:** `npm start` serves the placeholder page and `npm run test` is green. Log *Run 01* in `TESTS-LOG.md`.

---

## Stage 2: Calorie Engine

**Goal:** pure, fully tested calorie functions in `server/utils/calories.js` that match the §3.4 reference table exactly. They have no dependencies, which makes them the best place to start writing code.

### Task 2.1: Constants and conversion helpers

**Files:** `server/utils/calories.js` (new) · **Spec:** §3.3, §3.4

**Steps**
1. Export `REFERENCE_BODY_WEIGHT_KG = 70`.
2. Write and export small helpers, each with a comment that shows its formula:
   - `toMetersPerMinute(speedKmh)` → `speedKmh × 1000 / 60` (the symbol `S`).
   - `vo2ToKcal(vo2, duration)` → `duration × (vo2 × BW / 1000) × 5`.
   - `roundToOneDecimal(x)` → `Math.round(x * 10) / 10`.

**Tests (Calories):** test each helper against a known value, for example `toMetersPerMinute(6)` → `100` and `roundToOneDecimal(165.666)` → `165.7`.

**Done when**
- [ ] The constant and all helpers are exported and tested.

### Task 2.2: Activity calorie functions

**Files:** `server/utils/calories.js` (edit) · **Spec:** §3.4

**Steps**
1. Implement the six §3.4 functions. Each takes one object argument and returns kcal rounded to 1 decimal: `calcWalkingKcal`, `calcRunningKcal`, `calcCyclingKcal`, `calcEllipticalKcal`, `calcRowingKcal` and `calcGenericKcal`.
2. Follow the §3.4 symbols: `S` is speed in m/min, `G` is incline / 100, `R` is resistance, and `BW` is 70. `difficulty` never affects the result.
3. Tip: write the reference-table tests first. They define when this task is done.

**Watch out:** cycling's simulated power uses the raw speed in **km/h** (`W = 10·R + 5·speed`), not `S`. With `S`, the reference ride comes out at 2179.5 kcal instead of 276.0.

**Tests (Calories):** one `it` per row of the §3.4 reference table (7 rows), checked with exact `assert.equal`. Also check that each result has at most one decimal: `assert.equal(x, Math.round(x * 10) / 10)`.

**Done when**
- [ ] All 7 reference values match exactly.

### Task 2.3: Activity router `calculateAerobicKcal`

**Files:** `server/utils/calories.js` (edit) · **Spec:** §3.4

**Steps**
1. `calculateAerobicKcal(session)` picks the function by `session.activity`. Unknown or missing activities fall back to `calcGenericKcal`.
2. Export it along with every other function and constant in the module.

**Tests (Calories):** each of the six activities is routed to the right function (compare with direct calls), and `activity: 'swimming'` uses the generic formula.

**Done when**
- [ ] The Calories group covers every export of `calories.js`.

**Stage 2 gate:** the Calories group is green. Log the run.

---

## Stage 3: Domain Models

**Goal:** the §3.1 class hierarchy, with serialization (`toJSON`, `toDB`) and rehydration (`fromJSON`), fully unit-tested.

```text
User                 models/User.js
Training             models/Training.js   ← catalog item; abstract calculateEffortScore()
 └── BaseSession     models/Session.js    ← own sessionId counter, + date
      ├── AerobicSession                  ← kcal via calculateAerobicKcal()
      └── PowerSession                    ← sets × reps × weight
```

**Testing note for this stage:** every `idCounter` is static, so all tests in the file share it. Assert relative changes (`before + 1`), never absolute ids.

### Task 3.1: `Training` (catalog item)

**Files:** `server/models/Training.js` (new) · **Spec:** §3.2, §3.5

**Steps**
1. Declare `static idCounter = 1`.
2. Write `constructor({ id, type, name, activity = null, muscleGroup = null, includeCalories = false })`. Use the given `id`, and take a new one from the counter only when no `id` is passed: `this.id = id ?? Training.idCounter++`.
3. Set the fields: `id`, `type` (`'Power'` or `'Aerobic'`), `name`, `activity` (Aerobic only, otherwise `null`), `muscleGroup` (Power only, otherwise `null`) and `includeCalories` (only Aerobic items can be `true`). Older records without `includeCalories` load as `false` through the default.
4. `calculateEffortScore()`: copy the throwing body from §3.2 word for word, including its comment.
5. `toJSON()` returns `{ id, type, name, activity, muscleGroup, includeCalories }`. `static fromJSON(obj)` returns `new Training(obj)`.
6. `module.exports = { Training }`.

**Tests (Models):** creating a `Training` without an `id` increments `Training.idCounter`, and creating one with an `id` doesn't. `includeCalories` defaults to `false`. `calculateEffortScore()` throws with a message containing `must be overridden` (`assert.throws(fn, /must be overridden/)`). `toJSON` and `fromJSON` round-trip.

**Done when**
- [ ] Every method of `Training` has a test.

### Task 3.2: `BaseSession`

**Files:** `server/models/Session.js` (new) · **Spec:** §3.2, §3.5, §8

**Steps**
1. Declare `class BaseSession extends Training` with its own `static idCounter = 1` for `sessionId`.
2. In the constructor, call `super({ id: trainingId, type, name, activity, includeCalories })` with the **catalog item's** id, so `Training.idCounter` is untouched. `includeCalories` is the session's own copy of the catalog option (§3.5). Then set `this.sessionId = sessionId ?? BaseSession.idCounter++` and `this.date = date`.
3. `calculateEffortScore()` stays abstract in `BaseSession`: the class doesn't define it, so it inherits `Training`'s version, which throws `calculateEffortScore() must be overridden in BaseSession`. Because calling it on a plain session fails, `AerobicSession` and `PowerSession` must each override it with a proper calculation (Task 3.3).
4. `toJSON()` returns `{ sessionId, trainingId: this.id, type, name, activity, includeCalories, date }`. The inherited `id` is serialized as `trainingId`, never as `id`.
5. `static fromJSON(obj)` picks the subclass by `obj.type`: `'Aerobic'` → `new AerobicSession(obj)`, `'Power'` → `new PowerSession(obj)`, anything else throws.

**Watch out**
- `trainingId` is required. Without it, `super()` silently takes a new catalog id from `Training.idCounter`.
- Construct the subclasses directly inside `BaseSession.fromJSON`. If a subclass ever lacks its own `fromJSON`, calling `AerobicSession.fromJSON` runs the inherited `BaseSession.fromJSON` again, which loops forever.

**Tests (Models):** `calculateEffortScore()` on a `BaseSession` instance throws `must be overridden`. Creating a session increments `BaseSession.idCounter` and leaves `Training.idCounter` unchanged, and the session's `trainingId` equals the catalog id. The session keeps the `includeCalories` value it was created with.

**Done when**
- [ ] Session ids and catalog ids are proven independent.

### Task 3.3: `AerobicSession` and `PowerSession`

**Files:** `server/models/Session.js` (edit) · **Spec:** §3.2, §3.3, §3.5, §8

**Steps**
1. `AerobicSession extends BaseSession` adds `duration`, `speed`, `difficulty`, `incline` and `resistance`. Whichever of the last two the activity doesn't use is `null`: running and walking use `incline`, cycling, elliptical and rowing use `resistance`, and `other` uses neither.
2. `AerobicSession.calculateEffortScore()` returns `calculateAerobicKcal(this)` from `utils/calories.js`.
3. `PowerSession extends BaseSession` adds `muscleGroup`, `reps`, `sets` and `weight`. `muscleGroup` is pre-filled from the catalog item when the session is created and can be changed.
4. `PowerSession.calculateEffortScore()` returns `sets * reps * weight`, rounded with `Math.round(x * 10) / 10`. Weights like 22.5 kg can leave floating-point noise.
5. Each subclass gets `toJSON()`, returning `{ ...super.toJSON(), <own fields>, effortScore: this.calculateEffortScore() }` (D-07), and its own `static fromJSON(obj)`.
6. Add `calories` (§3.5): `AerobicSession.toJSON()` adds `calories: this.includeCalories ? calculateAerobicKcal(this) : null`. `PowerSession.toJSON()` adds `calories: null`, because Power exercises can't use the option.
7. `module.exports = { BaseSession, AerobicSession, PowerSession }`.

**Tests (Models):** `BaseSession.fromJSON` returns the right subclass for each `type` (check with `instanceof`). The `PowerSession` score equals `sets * reps * weight`, for example 3 × 10 × 22.5 = `675`. The `AerobicSession` score follows the activity: the running reference gives `257.8` and the cycling reference gives `276`. Session JSON has `trainingId`, `effortScore` and `calories`, and no `id`. With `includeCalories: true`, an `AerobicSession`'s `calories` equals its kcal (running reference → `257.8`); with `false` it is `null`, and a `PowerSession` always has `calories: null`. Each subclass's `toJSON` and `fromJSON` is tested.

**Done when**
- [ ] Both subclasses override `calculateEffortScore()`, and every method has a test.

### Task 3.4: `User`

**Files:** `server/models/User.js` (new) · **Spec:** §3.2, §3.3

**Steps**
1. Declare `static idCounter = 1` and write `constructor({ id, name, tel, role, password, sessions = [] })` with `this.id = id ?? User.idCounter++`.
2. `toJSON()` returns `{ id, name, tel, role, sessions }`, with **no `password`**. `res.json(user)` calls it automatically.
3. `toDB()` returns `{ ...this.toJSON(), password }`. It is the only shape ever written to `users.json`.
4. `static fromJSON(obj)` returns a `User` whose sessions are rehydrated: `(obj.sessions ?? []).map((s) => BaseSession.fromJSON(s))`.
5. `module.exports = { User }`.

**Watch out:** write `.map((s) => BaseSession.fromJSON(s))`, not `.map(BaseSession.fromJSON)`. The short form also passes the index and the array, and loses `this` inside the static method.

**Tests (Models):** the id counter increments. `JSON.stringify(user)` contains no `password`, while `toDB()` does. `fromJSON` returns a `User` whose sessions are subclass instances.

**Done when**
- [ ] The Models group covers every check in the §13 Models row.

**Stage 3 gate:** the Models group is green. Log the run.

---

## Stage 4: Persistence Layer

**Goal:** `server/utils/db.js` provides crash-safe JSON writes, rehydration into class instances, ID counter reseeding, and the seed-password bootstrap (D-05).

### Task 4.1: `readDB` and `writeDB`

**Files:** `server/utils/db.js` (new) · **Spec:** §5, §10

**Steps**
1. Resolve the folder **inside every call** with `process.env.DB_DIR || path.join(__dirname, '..', 'db')`. Never cache it at module load; the tests depend on this.
2. `readDB(file)` reads the file with `fs/promises` and `JSON.parse`s it.
3. `writeDB(file, data)` writes `JSON.stringify(data, null, 2)` to `<file>.tmp`, then `fs.rename()`s it over the original. Every write in the app goes through this one helper.

**Tests (DB utils):** a round-trip on a scratch file (for example `roundtrip.json`) returns deep-equal data, and no `.tmp` file is left in the folder. Switching `DB_DIR` between two folders changes where reads happen.

**Done when**
- [ ] Both functions are exported and tested.

### Task 4.2: `bootstrapSeedPasswords`

**Files:** `server/utils/db.js` (edit) · **Spec:** §5, §6

**Steps**
1. Read `users.json`, and hash every `password` that doesn't start with `$2` using `bcrypt.hash(password, 10)`.
2. Write the file back with `writeDB` only if something changed. Return the number of passwords hashed.

**Tests (DB utils):** in a second temp folder, use a fixture with one plaintext password and one hashed password. Afterwards, the plaintext one is a bcrypt hash (`bcrypt.compare` with the original succeeds) and the existing hash is unchanged.

**Watch out:** at the end of every fixture test, point `process.env.DB_DIR` back at the main temp folder. The later groups share it.

**Done when**
- [ ] Plaintext seed passwords become hashes, and existing hashes are never re-hashed.

### Task 4.3: `loadAll`: rehydration, in-memory state and counter reseed

**Files:** `server/utils/db.js` (edit) · **Spec:** §3.3, §5

**Steps**
1. `loadAll()` reads the three files and rehydrates them: users with `User.fromJSON`, trainings with `Training.fromJSON`. The options stay as `{ muscleGroups: [...] }`.
2. Reseed each counter to `max + 1`, or `1` when there are no records (§3.3):
   - `User.idCounter` from the user ids.
   - `Training.idCounter` from the catalog ids and every session `trainingId` (D-06).
   - `BaseSession.idCounter` from every `sessionId` across all users.
3. Keep the result in module-level state and return it. Give the routes access through a small accessor, for example `getState()`. Thin save helpers are optional, for example `saveUsers()`, which calls `writeDB('users.json', users.map((u) => u.toDB()))`. Export and test every helper you add.

**Tests (DB utils):** after `loadAll()`, every record is a class instance (`instanceof User`, `Training`, `AerobicSession` or `PowerSession`), and each counter equals `max + 1`. With empty arrays (in the second temp folder), each counter is `1`.

**Done when**
- [ ] No plain objects remain in memory after loading.

### Task 4.4: Wire up startup

**Files:** `server/server.js`, `server/tests/system.test.js` (edit) · **Spec:** §5, §10, §13

**Steps**
1. In `server.js`, inside the `require.main === module` block, run `await bootstrapSeedPasswords()`, then `await loadAll()`, then `app.listen(3000)`.
2. In the test `before()`, call the same two functions after requiring `server.js` and before `app.listen(0)`.
3. Run `npm start` once. `server/db/users.json` now holds bcrypt hashes. Restart, and confirm that nothing is re-hashed. This change to the seed file is expected (§5); Task 13.6 resets the seed files before delivery.

**Done when**
- [ ] Startup and the tests both bootstrap and load the database before serving requests.
- [ ] The hashes in `users.json` are noted in `TESTS-LOG.md` as evidence for AUTH-03.

**Stage 4 gate:** the DB utils group is green, and `npm start` boots, hashes the seed passwords and serves the page. Log the run.

---

## Stage 5: Input Validation

**Goal:** `server/middlewares/validation/validate.js` enforces every §4 rule on every write and returns `400 { error }` when one is broken (D-08).

**Design for this stage:** keep each rule in a small pure function, which is easy to unit-test. Keep the five named middlewares thin. They call the rules and return `400` on the first failure. On success they write the **normalized** values back to `req.body` (numbers converted, strings trimmed, muscle groups lowercased), so the handlers store clean data.

**Mock helper (add once, in this stage):** `runMiddleware(mw, req)` builds a fake `res` whose `status()` returns `res` and whose `json()` records the body. It passes a `next` spy, awaits the middleware, and returns `{ nextCalled, status, body }`. Stages 5 and 6 both use it.

### Task 5.1: Rule constants and primitive helpers

**Files:** `server/middlewares/validation/validate.js` (new) · **Spec:** §4

**Steps**
1. Export the enum arrays used everywhere (the client mirrors them in Task 9.1): `ROLES`, `TYPES`, `ACTIVITIES`, `DIFFICULTIES`, plus `INCLINE_ACTIVITIES = ['running', 'walking']` and `RESISTANCE_ACTIVITIES = ['cycling', 'elliptical', 'rowing']`.
2. Export the patterns: `TEL_PATTERN = /^05\d-?\d{7}$/` and `MUSCLE_GROUP_PATTERN = /^[A-Za-z -]{2,30}$/`.
3. Write the helpers:
   - `toNumber(value)` returns a finite number, or `NaN` for empty, missing or non-numeric input.
   - `isValidDate(str)` requires strict `YYYY-MM-DD`, a real calendar date, and no date after today's local date (D-15).
   - Range and integer checks.

**Watch out:** `Number('')`, `Number(' ')` and `Number(null)` all return `0`, so an empty field would pass as zero. Treat empty and missing values as `NaN` before converting.

**Tests (Validation):** `toNumber('12')` → `12`. `toNumber('abc')`, `toNumber('')` and `toNumber(null)` → `NaN`. `isValidDate` accepts a past date and rejects a future date, `2026-02-30` and `06/10/2026`.

**Done when**
- [ ] The constants and helpers are exported and tested.

### Task 5.2: `validateRegister` and `validateCreateUser`

**Files:** `server/middlewares/validation/validate.js` (edit) · **Spec:** §4, §8

**Steps**
1. Shared user rules: `name` is a string, trimmed, 2–50 characters. `tel` matches `TEL_PATTERN`. `password` is a string of at least 4 characters.
2. `validateRegister` applies the shared rules and ignores any `role` in the body (D-09).
3. `validateCreateUser` applies the shared rules and requires `role` to be `'user'` or `'admin'`, so `role: 'superadmin'` → `400` (§8). The rule that an admin may only create users is a permission check, so it lives in the route (Task 7.4, D-08).
4. Name uniqueness (`409`) is checked in the route handlers (D-08).

**Tests (Validation):** one passing and one failing case per field:
- `name`: `'Al'` passes; `'A'` and a 51-character name fail.
- `tel`: `050-1234567` and `0501234567` pass; `0401234567` and `050-123456` fail.
- `password`: `'1234'` passes; `'123'` fails.
- `role`: `admin` passes; `superadmin` and `boss` fail.

**Done when**
- [ ] Both middlewares call `next()` for valid input and return `400 { error }` otherwise.

### Task 5.3: `validateTraining` and `validateMuscleGroupOption`

**Files:** `server/middlewares/validation/validate.js` (edit) · **Spec:** §3.5, §4, §8

**Steps**
1. `validateTraining` on POST: `type` must be in `TYPES`, and `name` must be trimmed and 2–50 characters long.
   - Aerobic: `activity` must be in `ACTIVITIES`, and `muscleGroup` becomes `null`. `includeCalories` is optional and defaults to `false`; when present, it must be a JSON boolean (`true` or `false`).
   - Power: `muscleGroup` must match `MUSCLE_GROUP_PATTERN` and is stored trimmed and lowercased; `activity` becomes `null`. `includeCalories` must be absent or `false` (`true` → `400`) and is stored as `false`.
2. `validateTraining` on PUT (when `req.params.id` is present): look up the stored item and return `404` if it doesn't exist (D-08). A body `type` that differs from the stored type → `400`. Then validate `name`, plus `activity` and `includeCalories` (Aerobic) or `muscleGroup` (Power). An `includeCalories` left out of a PUT keeps the stored value.
3. `validateMuscleGroupOption`: `value` is trimmed and must match `MUSCLE_GROUP_PATTERN`; otherwise return `400` with the message `Use English letters only.` On success, store the value lowercased. Duplicates (`409`) are checked in the route (D-08).

**Note:** every value in the options list already matches `MUSCLE_GROUP_PATTERN`. For catalog items, the §4 rule "a list value or a valid custom value" therefore comes down to the pattern check.

**Tests (Validation):** the `type` and `activity` enums; exercise name length; a PUT that changes `type` → `400`. A catalog `muscleGroup` of `'Forearms'` passes and is stored as `'forearms'`, while `'x'`, `'<script>'` and `'כתפיים'` fail. Repeat the same cases for an option `value`. For `includeCalories`: `true` and `false` pass for an Aerobic item; `'yes'`, `1` and `'true'` fail; `true` fails for a Power item; a POST without it stores `false`; a PUT without it keeps the stored value.

**Done when**
- [ ] The §13 muscle-group cases (`"Forearms"`, `"x"`, `"<script>"`, `"כתפיים"`) and the `includeCalories` cases are covered.

### Task 5.4: `validateSession`

**Files:** `server/middlewares/validation/validate.js` (edit) · **Spec:** §4, §8

**Steps**
1. Work out the context (D-12):
   - POST: find the catalog item by `trainingId` (missing or unknown → `400`). `type`, `activity` and `includeCalories` come from it.
   - PUT: find the stored session under `:userId` (unknown → `404`). `type`, `activity` and `includeCalories` come from it, and any of them in the body must match the stored value or be absent (otherwise `400`).
2. Common rule: `date` is a valid `YYYY-MM-DD` date that is not in the future.
3. Aerobic rules:
   - `duration` is 1–600, `speed` is 0.1–15.5, and `difficulty` is in `DIFFICULTIES`.
   - `incline` is 0–15 and required for running and walking.
   - `resistance` is an integer from 1 to 10 and required for cycling, elliptical and rowing.
   - The field the activity doesn't use must be empty, and is stored as `null` (D-11).
4. Power rules (D-13):
   - `muscleGroup` defaults to the catalog item's value when it's missing on POST. It must be a value from the options list, the catalog item's own value, or, on PUT, the session's current value.
   - `reps` and `sets` are integers from 1 to 1000.
   - `weight` is 0–500, where 0 means bodyweight.
5. Write the normalized, whitelisted fields to `req.body`. A PUT can never change `trainingId`, `type`, `activity`, `includeCalories`, `name` or `sessionId`.

**Tests (Validation):**
- At least the §13 cases: `speed: 15.5` passes, `speed: 16` fails, the string `"12"` is accepted, `"abc"` is rejected, and running without `incline` fails.
- Also: cycling with an `incline` value fails; `resistance: 5.5` fails; `reps: 0` and `reps: 2.5` fail; `weight: 0` passes and `weight: 501` fails; a future date fails; an unknown `trainingId` fails; a session `muscleGroup` outside the allowed values fails; a PUT that tries to change `includeCalories` fails.
- For the PUT cases, add a session to the loaded state directly through `getState()`, because the sessions API only arrives in Stage 7.

**Done when**
- [ ] Every §4 field has one passing test and at least one failing test (§13 Validation row).

**Stage 5 gate:** the Validation group is green. Log the run.

---

## Stage 6: Authentication & Access Middlewares

**Goal:** the three middleware files from §6, each tested with mock `req`/`res`/`next`. Each calls `next()` when the request is allowed and returns the correct `401` or `403` otherwise.

### Task 6.1: `authenticateToken` (and `signToken`)

**Files:** `server/middlewares/auth/authenticate.js` (new) · **Spec:** §6, §7

**Steps**
1. Read the secret on each call: `process.env.JWT_SECRET || '<dev-only fallback>'`, with a comment saying the fallback is for development only.
2. `signToken(user)` returns `jwt.sign({ userId, role, name }, secret, { expiresIn: '2h' })` (D-16).
3. `authenticateToken` expects `Authorization: Bearer <token>`. A missing or malformed header, an invalid signature or an expired token → `401 { error }`. On success it sets `req.user = { userId, role, name }`.
4. Recommended (D-16): look up the user, and return `401` if they no longer exist or the stored name differs.
5. `module.exports = { authenticateToken, signToken }`.

**Tests (Middlewares):** each of these returns `401`: no header, `Bearer garbage`, a token whose `exp` is in the past, and a token for a deleted user. A valid token calls `next()` and sets `req.user`. The `signToken` payload contains exactly `userId`, `role` and `name`, and `exp - iat === 7200`.

**Done when**
- [ ] Every `401` path is tested.

### Task 6.2: Role checks

**Files:** `server/middlewares/roles/authorize.js` (new) · **Spec:** §2.2, §6

**Steps**
1. `requireSuperAdmin`: passes when `req.user.role === 'superadmin'`, otherwise `403`.
2. `requireAdminOrSuperAdmin`: passes when the role is `admin` or `superadmin`, otherwise `403`.
3. Both assume `authenticateToken` ran first. If `req.user` is missing, return `401`.
4. `module.exports = { requireSuperAdmin, requireAdminOrSuperAdmin }`.

**Tests (Middlewares):** each function against each role (6 cases), plus a missing `req.user` → `401`.

**Done when**
- [ ] Both exports are tested for all three roles.

### Task 6.3: Ownership checks

**Files:** `server/middlewares/ownership/ownership.js` (new) · **Spec:** §2.2, §6

**Steps**
1. `verifyUserOwnership` (reading a user): the owner or any admin or superadmin → `next()`. Anyone else → `403`.
2. `requireSelf` (creating a session): only the owner passes, whatever their role, so a superadmin can't log a session for someone else. Anyone else → `403`.
3. `requireOwnerOrSuperAdmin` (editing or deleting a session): the owner (any role) or a superadmin passes. Anyone else → `403`.
4. Access is checked before existence (D-14).
5. `module.exports = { verifyUserOwnership, requireSelf, requireOwnerOrSuperAdmin }`.

**Watch out:** route params are strings. Compare with `Number(req.params.userId) === req.user.userId`.

**Tests (Middlewares):** each function with the owner, another user, an admin and a superadmin. In particular, an admin passes `verifyUserOwnership` for another user but fails `requireOwnerOrSuperAdmin`, and a superadmin fails `requireSelf` for another user.

**Done when**
- [ ] Every export of the three middleware files is tested.

**Stage 6 gate:** the Middlewares group is green. Log the run.

---

## Stage 7: REST API

**Goal:** the five routers from §8. Each task adds its endpoints and mounts the router in `server.js`. It also adds tests to the API routes group: the success status plus at least one denied or invalid case per endpoint, with `assertNoPassword` on every response body.

**Handler pattern for every route:**

```js
router.post('/', authenticateToken, requireAdminOrSuperAdmin, validateTraining, async (req, res) => {
  try {
    // 1. read the in-memory state   2. check conflicts (409) and existence (404)
    // 3. change the class instances  4. persist with writeDB()   5. respond
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Test fixtures:** in a `before()` for the group, log in as the seed superadmin and admin, and register two regular users (available once Task 7.1 is done). Tests create their own exercises and sessions and never rely on seed sessions.

### Task 7.1: `auth.routes.js`: register and login

**Files:** `server/routes/auth.routes.js` (new), `server/server.js` (edit) · **Spec:** §6, §8

**Steps**
1. `POST /api/auth/register` (`validateRegister`): if the name is already taken (case-insensitive) → `409`. Otherwise hash the password (bcrypt, 10 rounds), create `new User({ ..., role: 'user' })` (D-09), persist, and return `201 { token, user }`.
2. `POST /api/auth/login` (no middleware): find the user by name, trimmed and case-insensitive (D-10), and check the password with `bcrypt.compare`. An unknown user and a wrong password get the **same** `401` message. On success return `200 { token, user }`.
3. Mount the router: `app.use('/api/auth', authRoutes)`.

**Tests (API routes):** register → `201` with a token and `role: 'user'`, even when the body says `admin`. A duplicate name in a different case → `409`. A bad `tel` → `400`. Login → `200`. A wrong password and an unknown user both → `401` with identical messages. No body contains `password`.

**Done when**
- [ ] AUTH-01 and AUTH-02 are covered by automated tests.

### Task 7.2: `options.routes.js`: muscle-group list

**Files:** `server/routes/options.routes.js` (new), `server/server.js` (edit) · **Spec:** §5, §8

**Steps**
1. `GET /api/options/muscle-groups` (`authenticateToken`) → `200` with a `string[]`.
2. `POST /api/options/muscle-groups` (`authenticateToken`, `requireSuperAdmin`, `validateMuscleGroupOption`): if the value is already in the list (case-insensitive) → `409`. Otherwise append it, persist `options.json`, and return `201` with the updated list.
3. Mount the router at `/api/options`.

**Tests (API routes):** GET → `200` for every role and `401` without a token. POST as superadmin → `201` with the new value in the list. POST as admin → `403`, and as user → `403`. `'CHEST'` → `409`. Hebrew text → `400`.

**Done when**
- [ ] RBAC-05 is covered by automated tests.

### Task 7.3: `trainings.routes.js`: catalog CRUD

**Files:** `server/routes/trainings.routes.js` (new), `server/server.js` (edit) · **Spec:** §2.2, §3.5, §8

**Steps**
1. `GET /api/trainings` (`authenticateToken`) → `200` with a `Training[]`.
2. `POST /api/trainings` (`authenticateToken`, `requireAdminOrSuperAdmin`, `validateTraining`): an existing exercise with the same name and type (case-insensitive) → `409`. Otherwise create, persist and return `201`. A custom `muscleGroup` is stored on the exercise only; `options.json` doesn't change (§8). `includeCalories` is saved as validated (`false` when left out).
3. `PUT /api/trainings/:id` (same middleware): an unknown id → `404`, and a different `type` → `400`. Update `name` plus `activity` and `includeCalories` (Aerobic) or `muscleGroup` (Power), check uniqueness (`409`, ignoring the item itself), and return `200`.
4. `DELETE /api/trainings/:id` (`authenticateToken`, `requireSuperAdmin`): an unknown id → `404`. Otherwise remove, persist and return `204`.
5. Logged sessions keep their own copies of `type`, `name`, `activity`, `muscleGroup` and `includeCalories`, so PUT and DELETE never touch them (§8).
6. Mount the router at `/api/trainings`.

Because only admins and superadmins pass `requireAdminOrSuperAdmin`, these routes are also the only way to change `includeCalories`. No extra permission check is needed (§2.2, §3.5).

**Tests (API routes):**
- GET → `200`.
- POST: admin and superadmin → `201`, user → `403`, duplicate → `409`, invalid body → `400`.
- PUT: admin and superadmin → `200`, user → `403`, `type` change → `400`, unknown id → `404`.
- An existing session is unchanged after a PUT on its exercise and after the exercise is deleted.
- DELETE: superadmin → `204`, admin → `403`.
- Saving a custom muscle group leaves `options.json` unchanged (read the temp file before and after).
- `includeCalories`: admin and superadmin can turn it on and off with POST and PUT; a user gets `403`; `true` on a Power exercise → `400`. Turning it off leaves a session already logged with `calories` unchanged.

**Done when**
- [ ] RBAC-03 (exercise part), RBAC-04 (API part), RBAC-10 (API part), DM-05 (catalog part) and UI-10 (API part) are covered.

### Task 7.4: `users.routes.js`: user management

**Files:** `server/routes/users.routes.js` (new), `server/server.js` (edit) · **Spec:** §2.2, §8

**Steps**
1. `GET /api/users` (`authenticateToken`, `requireAdminOrSuperAdmin`) → `200` with a `User[]`, sessions included.
2. `GET /api/users/:userId` (`authenticateToken`, `verifyUserOwnership`): unknown → `404`. Otherwise `200` with the `User` and their sessions.
3. `POST /api/users` (`authenticateToken`, `requireAdminOrSuperAdmin`, `validateCreateUser`): an admin asking for `role: 'admin'` → `403` (D-08), and a name already taken → `409`. Otherwise hash the password, create the user, persist, and return `201` with the `User`.
4. `DELETE /api/users/:userId` (`authenticateToken`, `requireSuperAdmin`): deleting yourself → `400`, and an unknown id → `404`. Otherwise remove the user (their sessions go with them), persist, and return `204`.
5. Mount the router at `/api/users`.

**Tests (API routes):**
- GET all: admin and superadmin → `200`, user → `403`, no token → `401`.
- GET one: own profile → `200`, a user reading another user → `403`, an admin reading another user → `200`, an unknown id as admin → `404`.
- POST: admin creating a `user` → `201`, admin creating an `admin` → `403`, superadmin creating an `admin` → `201`, anyone asking for `superadmin` → `400`, user → `403`, duplicate name → `409`.
- DELETE: superadmin → `204` (the user and their sessions are gone), deleting yourself → `400`, admin → `403`, unknown id → `404`.

**Done when**
- [ ] RBAC-01 and RBAC-02 are covered by automated tests.

### Task 7.5: `sessions.routes.js`: personal session log

**Files:** `server/routes/sessions.routes.js` (new), `server/server.js` (edit) · **Spec:** §3.2, §3.5, §8

**Steps**
1. Create the router with `express.Router({ mergeParams: true })` and mount it at `/api/users/:userId/sessions`. Mount it before the users router, since the more specific path should come first.
2. `POST /` (`authenticateToken`, `requireSelf`, `validateSession`):
   1. Copy `type`, `name`, `activity` and `includeCalories` from the catalog item. For Power, pre-fill `muscleGroup` from it unless the body sets one (D-13).
   2. Create the session with `BaseSession.fromJSON({ trainingId, ... })` and no `sessionId`, so the counter assigns one.
   3. Push it to the user's `sessions`, persist, and return `201` with the session, including its `effortScore` and `calories`.
3. `PUT /:sessionId` (`authenticateToken`, `requireOwnerOrSuperAdmin`, `validateSession`): apply only the validated, editable fields, persist, and return `200` with the session and its recalculated `effortScore`.
4. `DELETE /:sessionId` (`authenticateToken`, `requireOwnerOrSuperAdmin`): unknown → `404`. Otherwise remove, persist and return `204`.

**Tests (API routes):**
- POST: own session → `201` with the correct `effortScore`; for another user → `403`, even as superadmin; `speed: 16`, running without `incline`, or a future date → `400`.
- `calories`: a session of an Aerobic exercise with `includeCalories: true` returns `calories` equal to its §3.4 kcal; sessions of other exercises return `calories: null`.
- PUT: own session → `200` with a recalculated score; changing `type` or `activity` → `400`; an admin editing another user's session → `403`; a superadmin doing the same → `200`.
- DELETE: own session → `204`, including an admin's own; another user's session as user or admin → `403`, as superadmin → `204`; unknown session → `404`.

**Done when**
- [ ] RBAC-06, RBAC-07 and RBAC-08 (session parts), DM-04 (API part) and DM-05 (session part) are covered.

### Task 7.6: API contract audit

**Files:** `server/tests/system.test.js` (edit) · **Spec:** §6, §8, §13

**Steps**
1. Go through the §8 table row by row (15 rows) and confirm that each row has a success test and at least one denied or invalid test. Add whatever is missing.
2. Confirm that every API test runs `assertNoPassword` on its response.
3. Confirm that every error response checked in the tests has the `{ error: <string> }` shape.

**Done when**
- [ ] All 15 endpoints are covered (§13 API routes row), and AUTH-04 is covered.

**Stage 7 gate:** the server is feature-complete and the full suite is green. Log the run.

---

## Stage 8: RBAC Verification & Hardening

**Goal:** prove the §2.2 permission matrix end to end, and review the server against the security and error rules before building the UI.

### Task 8.1: RBAC test group

**Files:** `server/tests/system.test.js` (edit) · **Spec:** §2.2, §13

**Steps**
1. In the RBAC group, write **one `it` per row of the §2.2 matrix** (16 rows, including the **Include calorie burn** row). Each test checks all three roles: allowed means the success status, denied means `403`, and `n/a` is skipped with a comment.
2. Name each test after its row, for example `"Delete another user's session: superadmin 204, admin 403, user 403"`.
3. Include the two cases §13 names explicitly: **an admin deleting their own session → `204`**, and **an admin deleting another user's session → `403`**.

**Done when**
- [ ] All 16 RBAC tests are green, and each one checks all three roles.

### Task 8.2: Security and error-contract review

**Files:** server code (edit only if the review finds a problem) · **Spec:** §6, §7, §10, §11

**Checklist**
- [ ] Every route handler has a `try/catch` that returns `500 { error }`.
- [ ] Every error body is `{ error: "<message>" }`, and status codes follow the §6 table.
- [ ] No response can contain `password`: responses only ever serialize users through `User.toJSON()`.
- [ ] Login returns the same message for an unknown user and for a wrong password.
- [ ] The JWT payload is `{ userId, role, name }` with `expiresIn: '2h'`, and the secret comes from `process.env.JWT_SECRET`, with a commented, dev-only fallback.
- [ ] Every middleware chain matches the §8 Middleware column exactly.
- [ ] `server.js` only wires up middlewares and routers.
- [ ] There is no `var`, and the server uses CommonJS throughout.

**Done when**
- [ ] Every checklist item is ticked, and every fix ships with a test.

### Task 8.3: Record server-side acceptance evidence

**Files:** `TESTS-LOG.md` (edit) · **Spec:** §14

**Steps**
1. Log the full test run.
2. For each §14 check that is purely API-level, set Result to `Pass` and cite the test names as evidence. AUTO-01 waits for Task 13.3.
3. Checks with a UI part (for example AUTH-05, RBAC-04, RBAC-06 and DM-04) stay `Pending` with the note "API ✓" until Stage 13.

**Done when**
- [ ] Every API-level §14 check is `Pass`, with evidence.

**Stage 8 gate:** the RBAC group is green and the run is logged.

---

## Stage 9: Client Pure Logic

**Goal:** all the business logic the UI needs, written as pure functions in `client/script.js` with no DOM access, required and tested from Node (§11, §13). Stages 10–12 then only connect these functions to the DOM.

**Test setup:** in the Client logic group, load the file with `const client = require('../../client/script.js')`. Each task adds its function to the `module.exports` object at the end of `script.js`.

### Task 9.1: Client constants and `toNumber`

**Files:** `client/script.js` (edit) · **Spec:** §4, §9, §11

**Steps**
1. Add one constants block that mirrors the server's validation arrays: types, activities, difficulties, roles, the incline and resistance activity lists, the two patterns, and the numeric limits (speed max 15.5, step 0.1, and so on). Every `<select>` is built from these arrays (§9).
2. `toNumber(value)` behaves exactly like the server helper: it returns a finite number, or `NaN` for empty, missing or non-numeric input.
3. Export the constants too, so the tests can compare them with the server's.

**Tests (Client logic):** the `toNumber` cases from Task 5.1. The client arrays deep-equal the arrays exported by `validate.js`, which catches any drift between client and server.

**Done when**
- [ ] `toNumber` and the constants are exported and tested.

### Task 9.2: `validateSessionInput`

**Files:** `client/script.js` (edit) · **Spec:** §4, §9

**Steps**
1. `validateSessionInput(input, { catalogItem, muscleGroups })` applies the same §4 session rules as the server (Task 5.4). It returns per-field messages for inline display, for example `{ valid: false, errors: { speed: 'Speed must be between 0.1 and 15.5 km/h.' } }`.

**Tests (Client logic):** a valid Aerobic input and a valid Power input pass. `speed: 16`, running without `incline`, `reps: 'abc'` and a future date each produce an error on the right field.

**Done when**
- [ ] The client accepts and rejects the same session inputs as the server.

### Task 9.3: `filterSessions` and `sortSessions`

**Files:** `client/script.js` (edit) · **Spec:** §9

**Steps**
1. `filterSessions(sessions, { type, muscleGroup, search })`:
   - `'All'` means no filter for that field.
   - The muscle-group filter applies only when the type isn't Aerobic.
   - `search` is a case-insensitive match on `name`.
   - All filters combine.
2. `sortSessions(sessions, { key, direction })`: the key is `date`, `name` or `effortScore`, and the direction is `asc` or `desc`. Return a sorted **copy** (`[...sessions].sort(...)`) and never mutate the input. Sorting runs after filtering.

**Tests (Client logic):** filters combined (type + muscle group + search); the muscle-group filter is ignored when the type is Aerobic; all three sort keys in both directions; the input array is left unchanged.

**Done when**
- [ ] Both functions are exported and cover every §9 filter and sort option.

### Task 9.4: `computeStats`

**Files:** `client/script.js` (edit) · **Spec:** §9

**Steps**
1. `computeStats(sessions, { role, userCount })` returns the four §9 values:
   1. **Total Users** for admins and superadmins (`userCount`), or **My Total Workouts** for users (the number of sessions).
   2. **Max Weight Lifted** (kg): the highest Power `weight`.
   3. **Average Aerobic Time** (minutes, 1 decimal).
   4. **Total Power Workouts**.
2. Empty data gives `0` values, never `NaN`, `Infinity` or `-Infinity`.

**Watch out:** `Math.max(...[])` returns `-Infinity`. Handle the empty case explicitly.

**Tests (Client logic):** admin scope vs. user scope; empty data; a mixed set with known results.

**Done when**
- [ ] All four values are correct for admin data, user data and empty data.

### Task 9.5: `buildInsights`

**Files:** `client/script.js` (edit) · **Spec:** §3, §3.5, §9

**Steps**
1. `buildInsights(sessions, { today })` returns at least 4 sentences, for example: the most trained muscle group, the longest aerobic session, workouts in the last 7 days, and estimated aerobic kcal this week.
2. For kcal, add up the server's `calories` on sessions where it isn't `null`, that is, sessions logged with **Include calorie burn** on (§3.5, §9). The client never repeats the calorie formulas (§3).
3. Give each insight its own friendly fallback sentence for missing data (D-18).
4. Take `today` as a parameter (default `new Date()`) so the date-based sentences can be tested. Format numbers with `toLocaleString('en-US')`, for example `1,240`.

**Tests (Client logic):** at least 4 sentences for real data and for empty data; no sentence contains `NaN` or `undefined`; a fixed `today` gives the exact 7-day count; the kcal sentence counts only sessions whose `calories` isn't `null`, and falls back to a friendly sentence when none has it.

**Done when**
- [ ] The function always returns 4 or more readable sentences.

### Task 9.6: Muscle-group helpers

**Files:** `client/script.js` (edit) · **Spec:** §9, §11

**Steps**
1. `buildMuscleGroupOptions(list, { withOther })` returns `[{ value, label }]`, with `{ value: '__other__', label: 'Other…' }` appended when `withOther` is true. A suggested label format is the value with a capital first letter, so `legs` becomes `Legs`.
2. `resolveMuscleGroupInput(selectValue, otherText, list)` returns `{ value, isNew }`. When `selectValue` is `'__other__'`, it uses `otherText` trimmed and lowercased. `isNew` is `true` only when that text isn't already in `list` (case-insensitive).
3. `shouldOfferAddToList(isNew, role)` returns `isNew && role === 'superadmin'`.

**Tests (Client logic):** the exact §13 cases:
- `buildMuscleGroupOptions`: with and without "Other…".
- `resolveMuscleGroupInput`: an existing option → `isNew: false`; new text → `isNew: true`; `"LEGS "` via Other → `{ value: 'legs', isNew: false }`.
- `shouldOfferAddToList`: superadmin with a new value → `true`; admin with a new value → `false`; superadmin with an existing value → `false`.

**Done when**
- [ ] All three helpers are exported and every §13 case passes.

**Stage 9 gate:** the Client logic group is green, and all nine §11 functions are exported and tested. Log the run.

---

## Stage 10: Client Shell & Authentication UI

**Goal:** the page structure, the visual design system, and a working login and register flow with the in-memory token lifecycle from §7.

### Task 10.1: Semantic page structure

**Files:** `client/index.html` (edit) · **Spec:** §9, §10

**Steps**
1. `<header>`: the app title, the current user's name, a role badge, and a Logout button, all hidden until login.
2. `<section id="auth">`: Login and Register tabs, each a `<form>` with labeled inputs and an inline message element.
3. `<main id="dashboard" class="hidden">` with one `<section>` per feature: Add Session, Filter & Sort, Sessions, Stats, Insights, Exercise Catalog (with the exercise form), and Users (the Create User form and the users list).
4. Every input has a `<label>`. Every form and every card has an inline message element (`aria-live="polite"`) for errors, since §9 forbids `alert()`.

**Done when**
- [ ] The page uses `header`, `main`, `section`, `article`, `form` and `label` as §10 requires, and the markup is valid (no unclosed or misnested tags).

### Task 10.2: Design system (`style.css`)

**Files:** `client/style.css` (edit) · **Spec:** §9, §10

**Steps**
1. Define design tokens as CSS custom properties: colors, spacing, radii and shadows.
2. Build a glassmorphic auth card: a translucent background, `backdrop-filter: blur(...)` and a soft border.
3. Lay out the page with CSS Grid (dashboard sections, card grid) and Flexbox (forms, header, button rows).
4. Style the components: buttons (primary, danger, ghost), role badges (one color per role), cards, inline messages (error and info), inline confirmation rows, and the `.hidden` utility.
5. Use mobile-first breakpoints (§10):
   ```css
   /* Mobile (≤ 600px): base styles, no media query */
   @media (min-width: 601px) and (max-width: 1024px) { /* tablet */ }
   @media (min-width: 1025px) { /* desktop */ }
   ```

**Done when**
- [ ] The auth screen and an empty dashboard look right at 375, 768 and 1280 px.

### Task 10.3: API client and token lifecycle

**Files:** `client/script.js` (edit, DOM layer) · **Spec:** §7

**Steps**
1. Keep the token in a variable only: `let authToken = null;` and `let currentUser = null;`.
2. `apiFetch(path, { method, body })` adds `Content-Type: application/json` and `Authorization: Bearer <token>`, parses JSON, and turns non-2xx responses into errors that carry the server's `{ error }` message.
3. On any `401`, clear the token and user, and show the login screen with a message.
4. Logout clears both variables and shows the login screen.

**Done when**
- [ ] No storage API (`localStorage`, `sessionStorage`, `document.cookie`) appears anywhere in `client/`.
- [ ] A page refresh returns to the login screen (AUTH-05, UI part).

### Task 10.4: Login and register flows

**Files:** `client/script.js` (edit, DOM layer) · **Spec:** §6, §9

**Steps**
1. Switch between the Login and Register tabs.
2. Validate inline before sending: name 2–50 characters, the phone pattern, password at least 4 characters.
3. On success, keep the token in memory, fill the header (name and role badge), hide `#auth` and show `#dashboard`.
4. Show server errors inline: `409` (name taken), `401` (generic login failure) and `400` (field rules).

**Done when**
- [ ] Register, login, logout and an expired or invalid token all behave as §7 describes, for all three roles.

**Stage 10 gate:** check manually as each role: register a new user, log in, see the role badge, log out. Log the results.

---

## Stage 11: Sessions Dashboard

**Goal:** the everyday features. Users add, view, edit, delete, filter and sort sessions, and stats and insights update after every change.

### Task 11.1: Data loading and render pipeline

**Files:** `client/script.js` (edit) · **Spec:** §2.2, §9

**Steps**
1. After login, load:
   - the catalog (`GET /api/trainings`);
   - the muscle-group list (`GET /api/options/muscle-groups`);
   - the sessions. Admins and superadmins use `GET /api/users` and flatten every user's sessions, tagging each with `ownerId` and `ownerName`. Users use `GET /api/users/:userId`.
2. Keep one client state object and one `renderDashboard()` function that re-renders the list, stats and insights from it. Call it after every add, edit or delete.

**Done when**
- [ ] Each role sees the right scope: admins and superadmins see everyone's sessions, and users see only their own.

### Task 11.2: Add Session form

**Files:** `client/index.html`, `client/script.js` (edit) · **Spec:** §9

**Steps**
1. The Type `<select>` filters the Exercise `<select>` to catalog items of that type.
2. Aerobic fields: duration, speed (`max="15.5"`, `step="0.1"`), a difficulty `<select>`, and **incline** for running and walking or **resistance** for cycling, elliptical and rowing (neither for `other`).
3. Power fields: a muscle-group `<select>` with no "Other…" option, pre-selected from the catalog item and listing the options plus the catalog item's own value if it isn't in the list; then reps, sets and weight.
4. A date input with `max` set to today.
5. Validate with `validateSessionInput` and show errors next to each field. Then `POST`, re-render, and show any server error inline.

**Done when**
- [ ] UI-01, UI-03 and DM-04 (UI part) pass.

### Task 11.3: Session cards

**Files:** `client/script.js`, `client/style.css` (edit) · **Spec:** §3.5, §9

**Steps**
1. Render each session as an `<article>` card that shows only the fields for its type.
2. Give every empty or `null` field the `.hidden` class, for example `incline` on a cycling session.
3. Show the `effortScore`. For admins and superadmins, also show the owner's name.
4. When `calories` isn't `null`, show it as "≈ X kcal". A `null` value is hidden by step 2.

**Done when**
- [ ] No card shows an empty label.
- [ ] UI-16 (card part) passes: cards of sessions logged with **Include calorie burn** on show "≈ X kcal", and no other card does.

### Task 11.4: Inline edit and inline delete

**Files:** `client/script.js` (edit) · **Spec:** §2.2, §9

**Steps**
1. Render the Edit and Delete buttons only when §2.2 allows them: on the viewer's own sessions (any role), and on every session for a superadmin.
2. Edit turns the card's fields into inputs and `<select>`s, with Save (`PUT`) and Cancel. `type` and `activity` stay read-only.
3. Delete shows an inline confirmation inside the card ("Delete this session? [Yes] [No]"), never `confirm()`.
4. Errors appear inline on the card.

**Done when**
- [ ] UI-12 and RBAC-06 (UI part) pass, and an admin sees no Edit or Delete buttons on other users' cards.

### Task 11.5: Filter, search and sort bar

**Files:** `client/index.html`, `client/script.js` (edit) · **Spec:** §9

**Steps**
1. Filters:
   - a Type `<select>`: All, Power, Aerobic;
   - a muscle-group `<select>`: All, the options list, and any custom values found in the current data. Disable and ignore it when the type is Aerobic;
   - a name search input.
2. Sorting: a sort-key `<select>` (date, name, effort score) and a direction toggle (ascending or descending).
3. Every `input` or `change` event runs `filterSessions`, then `sortSessions`, then re-renders, in real time.

**Done when**
- [ ] UI-11 passes.

### Task 11.6: Stats and insights panels

**Files:** `client/index.html`, `client/script.js` (edit) · **Spec:** §9

**Steps**
1. Show four stat cards from `computeStats`. The first reads "Total Users" for admins and superadmins and "My Total Workouts" for users.
2. Show an insights list from `buildInsights`.
3. Refresh both inside `renderDashboard()`, so they follow every change.

**Done when**
- [ ] UI-13 passes, including for a brand-new user with no sessions.

**Stage 11 gate:** run through the session features manually as each role. Log the results.

---

## Stage 12: Catalog & Administration UI

**Goal:** catalog management with the muscle-group "Other…" flow, user creation and user deletion. Each control is shown only to the roles allowed to use it.

### Task 12.1: Catalog list

**Files:** `client/index.html`, `client/script.js` (edit) · **Spec:** §2.2, §3.5, §9

**Steps**
1. List every exercise with its type, name, and activity or muscle group. Mark Aerobic exercises that have **Include calorie burn** on, for example with a small "kcal" badge.
2. Admins and superadmins get an Edit button. Only superadmins get a Delete button, with an inline confirmation. Regular users see a read-only list.

**Done when**
- [ ] RBAC-04 (UI part) passes: a user sees no Edit button.

### Task 12.2: Add/Edit Exercise form

**Files:** `client/index.html`, `client/script.js` (edit) · **Spec:** §3.5, §9

**Steps**
1. Fields:
   - Type: a `<select>`, read-only when editing.
   - Name: free text.
   - Activity: a `<select>`, shown for Aerobic only.
   - Include calorie burn: an `<input type="checkbox">`, shown for Aerobic only (§3.5). Unchecked by default. Changing the type to Power hides and unchecks it.
   - Muscle group: a `<select>` built with `buildMuscleGroupOptions(list, { withOther: true })`, shown for Power only.
2. Choosing "Other…" shows a required text input below the select, validated inline. Anything other than English letters, spaces or hyphens shows "Use English letters only." Choosing any other option hides the input and clears it.
3. Edit opens the same form pre-filled, with the checkbox showing the stored `includeCalories`. If the exercise's muscle group isn't in the list, pre-select "Other…" and fill in the text.
4. Save sends `POST` when adding and `PUT /api/trainings/:id` when editing, with `includeCalories` as a JSON boolean for Aerobic exercises. Show server errors inline.

**Done when**
- [ ] UI-04, UI-05 (UI part), UI-09 and UI-10 pass.
- [ ] UI-16 (form part) and RBAC-10 (UI part) pass: only admins and superadmins see the form, and the checkbox appears only for Aerobic exercises.

### Task 12.3: Shared-list flow after save

**Files:** `client/script.js` (edit) · **Spec:** §9

**Steps**
1. After a **successful** save, run `resolveMuscleGroupInput`. If the text matches an existing option, that option is used and nothing else appears.
2. An admin saving a new value sees an inline note and no prompt: *"Saved for this exercise only. Only a Super Admin can add it to the shared list."*
3. A superadmin saving a new value (`shouldOfferAddToList`) sees an inline prompt next to the form. It must be a DOM element, never `confirm()`: *Add "**forearms**" to the muscle group list for future use? [Yes] [No]*
   - **Yes:** call `POST /api/options/muscle-groups`, refresh the list, and re-render **every** muscle-group `<select>`: the exercise form, the session form, the filter bar and inline edit.
   - **No:** close the prompt. The value stays on this exercise only.

**Done when**
- [ ] UI-06, UI-07 (including after a reload and a new login) and UI-08 pass.

### Task 12.4: Create User form

**Files:** `client/index.html`, `client/script.js` (edit) · **Spec:** §2.2, §9

**Steps**
1. Only admins and superadmins see the form: name, phone, password and a role `<select>`.
2. The role options depend on the viewer: admins get `user` only, superadmins get `user` and `admin`. `superadmin` is never offered.
3. Show `409`, `403` and `400` errors inline. On success, refresh the users data.

**Done when**
- [ ] RBAC-02 (UI part) passes.

### Task 12.5: Users panel

**Files:** `client/index.html`, `client/script.js` (edit) · **Spec:** §2.2 (D-17)

**Steps**
1. Admins and superadmins see a list of users with name, role badge and session count.
2. Superadmins get a Delete button, with an inline confirmation, on every row except their own.
3. After a delete, reload the data. The deleted user's sessions disappear from the list, the stats and the insights.

**Done when**
- [ ] RBAC-08 (UI part) and RBAC-09 pass for all three roles.

**Stage 12 gate:** run through the catalog and admin features manually as each role. Log the results.

---

## Stage 13: QA & Delivery

**Goal:** prove the project meets every spec rule, finish the documents, and deliver a clean pull request.

### Task 13.1: Responsive and accessibility pass

**Files:** `client/style.css`, `client/index.html` (edit as needed) · **Spec:** §10, §14

**Steps**
1. In the DevTools device toolbar, check 375, 768 and 1280 px: no horizontal scrolling, no overlapping elements, and readable cards and forms.
2. Use the keyboard only: every control is reachable with Tab and shows a visible focus style.
3. Confirm that every input has a `<label>` and that text stays readable on the glass backgrounds.

**Done when**
- [ ] UI-14 passes.

### Task 13.2: Compliance audits

**Files:** none (read-only checks; fix anything found in its own commit) · **Spec:** §10, §11, §12

**Steps**
1. Forbidden APIs (UI-15): search `client/` for `localStorage`, `sessionStorage`, `document.cookie`, `alert(` and `confirm(`, and expect zero matches.
   ```bash
   # Git Bash
   grep -rnE "localStorage|sessionStorage|document\.cookie|alert\(|confirm\(" client/
   ```
   ```powershell
   # PowerShell
   Get-ChildItem client -Recurse -File | Select-String -Pattern 'localStorage|sessionStorage|document\.cookie|alert\(|confirm\('
   ```
2. Search every `.js` file outside `node_modules` for the keyword `var`, and expect zero declarations.
3. Dependencies: `server/package.json` lists only `express`, `cors`, `bcryptjs` and `jsonwebtoken`, and `index.html` loads no external scripts.
4. Folder tree: compare the project with §12 file by file. There must be no extra source files.
5. Names: every class, field, function, middleware, route and file name matches the spec.

**Done when**
- [ ] Every audit comes back clean, and UI-15 is `Pass`.

### Task 13.3: Coverage audit

**Files:** `server/tests/system.test.js` (edit if there are gaps) · **Spec:** §13

**Steps**
1. List each module's exports from `server/`, for example `node -e "console.log(Object.keys(require('./utils/calories')))"`. Do this for every server module and for `../client/script.js`. For classes, also list `Object.getOwnPropertyNames(Class.prototype)` and the static methods.
2. Check that every exported function, every class method and every client pure function appears in at least one test. Add tests for any gaps.
3. Run the full suite.

**Done when**
- [ ] AUTO-01 passes: 0 failures, and every function has a test.

### Task 13.4: Manual acceptance run

**Files:** `TESTS-LOG.md` (edit) · **Spec:** §14

**Steps**
1. Reset the database to the seed state (see Task 13.6, step 1) and start the server with `npm start`.
2. Work through every §14 check in the [Appendix](#appendix-acceptance-checklist-map-14) as the right role or roles, in a fresh browser tab for each role.
3. Record `Pass` or `Fail`, the date and the evidence for each check. Log every failure in the Defects table, fix it in its own commit, and re-test.

**Done when**
- [ ] All 37 checks are `Pass`.

### Task 13.5: Final documentation

**Files:** `README.md`, `AI-LOG.md`, `TESTS-LOG.md` (edit) · **Spec:** §12

**Steps**
1. `README.md`: resolve every `TODO (Task 13.5)`, and add a feature list and a short API overview of the §8 endpoints.
2. `AI-LOG.md`: check that every prompt has an entry and every decision is in the Decision Log. Add a closing summary.
3. `TESTS-LOG.md`: paste the final `npm run test` summary and the checklist totals.

**Done when**
- [ ] All three documents are complete, with no `TODO` left.

### Task 13.6: Release

**Files:** `server/db/*.json` (reset) · **Spec:** §5, §12, §13

**Steps**
1. Reset `server/db/*.json` to the clean seed from Task 1.5: the two seed users, the seed catalog and the six built-in muscle groups, with no manual-test data. Plaintext seed passwords are fine, because they are hashed on the first start (§5).
2. Run the suite on a fresh install: delete `server/node_modules`, then run `npm install` and `npm run test`.
3. Commit, push the branch, and open a pull request into `master` that summarizes the stages and the final test results.

**Done when**
- [ ] The pull request is open, and a fresh clone runs with `npm install`, `npm start` and `npm run test` exactly as the README says.

---

## Appendix: Acceptance Checklist Map (§14)

Use these IDs in `TESTS-LOG.md`. **Auto** means an automated test group provides the evidence. **Manual** means a check in the browser or with an HTTP client.

| ID | Check (§14) | Evidence | Task(s) |
|---|---|---|---|
| AUTO-01 | `npm run test` passes with 0 failures, and every exported function appears in at least one test | Auto + coverage audit | 13.3 |
| AUTH-01 | Register creates a `user` and returns a token; a duplicate name returns `409` | Auto (API routes) | 7.1, 10.4 |
| AUTH-02 | Login with a wrong password returns `401` with a generic message | Auto (API routes) | 7.1, 10.4 |
| AUTH-03 | Seed passwords are bcrypt hashes in `users.json` after the first start | Auto (DB utils) + Manual | 4.2, 4.4 |
| AUTH-04 | No API response contains `password` | Auto (API routes) | 7.6 |
| AUTH-05 | A request without a token returns `401`; a page refresh returns to the login screen | Auto + Manual | 6.1, 10.3 |
| RBAC-01 | A user can't reach `GET /api/users` or another user's `/api/users/:id` (`403`) | Auto (RBAC) | 7.4, 8.1 |
| RBAC-02 | An admin can create a `user` but gets `403` for an `admin`; a superadmin can create an `admin` | Auto + Manual | 7.4, 12.4 |
| RBAC-03 | An admin can add and edit an exercise, but gets `403` deleting an exercise, a user, or another user's session | Auto (RBAC) | 7.3–7.5, 8.1 |
| RBAC-04 | A user gets `403` on `PUT /api/trainings/:id` and sees no Edit button in the catalog | Auto + Manual | 7.3, 12.1 |
| RBAC-05 | A user and an admin get `403` on `POST /api/options/muscle-groups`; a superadmin gets `201` | Auto (RBAC) | 7.2, 8.1 |
| RBAC-06 | An admin can delete their own session (`204`), and the Delete button shows on their own cards | Auto + Manual | 7.5, 11.4 |
| RBAC-07 | A user can delete their own session, and gets `403` on someone else's | Auto (RBAC) | 7.5, 8.1 |
| RBAC-08 | A superadmin can delete any session, exercise, or user, but not themself (`400`) | Auto + Manual | 7.3–7.5, 12.5 |
| RBAC-09 | The UI hides the buttons for actions a role can't perform | Manual (all roles) | 11.4, 12.1–12.5 |
| RBAC-10 | An admin and a superadmin can turn **Include calorie burn** on and off for an Aerobic exercise; a user can't (`403`) | Auto (RBAC) + Manual | 7.3, 8.1, 12.2 |
| DM-01 | `calculateEffortScore()` throws on `Training`/`BaseSession` and is overridden in both session subclasses | Auto (Models) | 3.1–3.3 |
| DM-02 | Session IDs and catalog IDs are independent; IDs keep increasing after a server restart | Auto + Manual (restart) | 3.2, 4.3 |
| DM-03 | Aerobic calories match the §3.4 table for every activity; Power score = `sets * reps * weight` | Auto (Calories, Models) | 2.2, 3.3 |
| DM-04 | Invalid inputs (`reps: "abc"`, `speed: 16`, a future date) return `400` and show an inline error | Auto + Manual | 5.4, 11.2 |
| DM-05 | Sessions of an Aerobic exercise with **Include calorie burn** on carry `calories` equal to their §3.4 kcal; all other sessions have `calories: null`; turning the option on or off doesn't change sessions already logged | Auto (Models, API routes) | 3.3, 7.3, 7.5 |
| UI-01 | The Add form switches its inputs when the type changes, and shows incline or resistance depending on the activity | Manual | 11.2 |
| UI-02 | `muscleGroup`, `difficulty`, `activity`, `type` and `role` are `<select>` elements in every form and in inline edit | Manual | 11.2, 11.4, 11.5, 12.2, 12.4 |
| UI-03 | The speed input doesn't accept values above 15.5 | Manual | 11.2 |
| UI-04 | Exercise names are free text; choosing "Other…" shows a text field, and choosing another option hides and clears it | Manual | 12.2 |
| UI-05 | Non-English text in "Other…" shows "Use English letters only." and the server returns `400` | Auto + Manual | 5.3, 12.2 |
| UI-06 | As an admin, saving a new "Other…" value shows the "Saved for this exercise only…" note, with no prompt | Auto (Client logic) + Manual | 9.6, 12.3 |
| UI-07 | As a superadmin, saving a new "Other…" value shows the inline prompt; Yes adds the option to every select, also after a reload; No leaves the list unchanged while the exercise keeps the value | Manual | 12.3 |
| UI-08 | Typing an existing option (for example "Legs") under "Other…" uses it with no prompt | Auto (Client logic) + Manual | 9.6, 12.3 |
| UI-09 | Editing an exercise whose muscle group isn't in the list opens with "Other…" pre-selected and filled in | Manual | 12.2 |
| UI-10 | Editing an exercise doesn't change sessions already logged against it | Auto (API routes) + Manual | 7.3, 12.2 |
| UI-11 | Filters combine correctly, and sorting works in both directions for date, name and effort | Auto (Client logic) + Manual | 9.3, 11.5 |
| UI-12 | Inline edit saves and persists, and the inline delete confirmation works | Manual | 11.4 |
| UI-13 | All 4 stats and at least 4 insights update after every change and handle empty data | Auto (Client logic) + Manual | 9.4, 9.5, 11.6 |
| UI-14 | The layout works at 375, 768 and 1280 px | Manual | 13.1 |
| UI-15 | No `localStorage`, `sessionStorage`, `document.cookie` or `alert(` appears in `client/` | grep | 13.2 |
| UI-16 | The **Include calorie burn** checkbox appears in the exercise form only for Aerobic exercises, and cards of sessions logged with it on show "≈ X kcal" | Manual | 11.3, 12.2 |
