# AI System Prompt & Project Specification: Fitness Tracker Dashboard (Auth & RBAC)

**Objective:** Build a full-stack Vanilla JavaScript fitness tracking dashboard with password authentication and Role-Based Access Control (RBAC).
You are acting as an AI coding assistant. Follow every rule in this document strictly. If something is not covered here, choose the simplest option that does not break any rule below, and record that decision in `AI-LOG.md`.

---

## 1. Domain & Scope
* **Domain:** Gym Training Tracker.
* **Core concept:** The app tracks users and two types of workout session: **Power** and **Aerobic**.
* **Includes:** registration, login, three access roles, a shared exercise catalog, a personal session log per user, stats and insights, and an automated test suite.
* **Out of scope:** password reset, email, file uploads, and sessions that survive a page refresh (see §7).

---

## 2. Roles & Permissions (RBAC)

### 2.1 Roles
| Role | `role` value | Seed user | Default password |
|------|--------------|-----------|------------------|
| Super Admin | `superadmin` | "Hilli Schlesinger" | `1234` |
| Admin | `admin` | "Staff Admin" | `admin123` |
| Regular User | `user` | (created by registration) | (chosen at registration) |

### 2.2 Permission Matrix
This table is the single source of truth. Every API route and every UI control must enforce it.

| Action | superadmin | admin | user |
|--------|:---:|:---:|:---:|
| Register via public Register screen | n/a | n/a | ✅ (always creates `role: 'user'`) |
| View own profile & sessions | ✅ | ✅ | ✅ |
| View **all** users' profiles & sessions | ✅ | ✅ | ❌ |
| Create a user from the dashboard | ✅ (`user` or `admin`) | ✅ (`user` only) | ❌ |
| Delete a user (also deletes their sessions) | ✅ (never themself) | ❌ | ❌ |
| View exercise catalog | ✅ | ✅ | ✅ |
| Add exercise to catalog | ✅ | ✅ | ❌ |
| Edit exercise in catalog | ✅ | ✅ | ❌ |
| Turn **Include calorie burn** on or off for an Aerobic exercise (when adding or editing it, see §3.5) | ✅ | ✅ | ❌ |
| Add a new muscle-group option to the shared list | ✅ | ❌ | ❌ |
| Delete exercise from catalog | ✅ | ❌ | ❌ |
| Log (create) own session | ✅ | ✅ | ✅ |
| Edit own session | ✅ | ✅ | ✅ |
| Edit another user's session | ✅ | ❌ | ❌ |
| Delete own session | ✅ | ✅ | ✅ |
| Delete another user's session | ✅ | ❌ | ❌ |

Notes:
* An admin **can't delete users, catalog exercises, or other users' sessions**. The only thing an admin may delete is their own personal sessions.
* No one can create a `superadmin`, and no one can change an existing user's role.
* The UI must **not render** controls the current role can't use (for example, no Delete button on another user's card when viewing as admin). The server must still enforce every rule on its own.

---

## 3. Data Model (ES6 Classes)
Each class has its own file in `server/models/` (see §12). The calorie formulas are pure functions in `server/utils/calories.js`. The server computes `effortScore` and includes it in every session it sends to the client. The client never repeats the formulas.

### 3.1 Class Hierarchy
```text
User                          (static idCounter → id)

Training                      (static idCounter → id)      ← catalog item
 └── BaseSession              (static idCounter → sessionId) + date
      ├── AerobicSession      + activity, duration, speed, difficulty, incline, resistance
      └── PowerSession        + muscleGroup, reps, sets, weight
```

### 3.2 Classes
* **User** (`models/User.js`)
  * `static idCounter`, which auto-increments to give each user a unique `id`.
  * Properties: `id`, `name`, `tel`, `role`, `password` (bcrypt hash), `sessions` (array of session instances).
  * `toJSON()` must **leave out `password`**. Use a separate method, `toDB()`, to persist the hash.

* **Training** (`models/Training.js`, catalog level)
  * `static idCounter` for unique catalog IDs.
  * Properties: `id`, `type` (`'Power'` | `'Aerobic'`), `name` (free text), `activity` (Aerobic items only; `null` for Power), `muscleGroup` (Power items only; `null` for Aerobic), and `includeCalories` (boolean, default `false`; can be `true` only for Aerobic items, see §3.5). See §4.
  * The constructor takes an optional `id`. Only when no `id` is passed does it take one from `Training.idCounter`.
  * **Abstract method `calculateEffortScore()`**: defined here only to set the contract. It always throws:
    ```js
    // Abstract contract: every concrete session subclass MUST override this method.
    calculateEffortScore() {
      throw new Error(`calculateEffortScore() must be overridden in ${this.constructor.name}`);
    }
    ```
    Catalog items and `BaseSession` never call it. Any subclass that forgets to override it fails loudly instead of quietly returning a wrong score.

* **BaseSession extends Training** (`models/Session.js`; created when the user clicks **Add**)
  * Calls `super()` with the **catalog item's existing `id`**, so `Training.idCounter` is *not* incremented. The inherited `id` therefore points to the catalog exercise and is serialized as `trainingId`. `type`, `name`, `activity` and `includeCalories` are copied from the catalog item.
  * Adds `static idCounter` → `sessionId` (its own counter, separate from catalog IDs).
  * Adds `date`.
  * Does **not** override `calculateEffortScore()`. It inherits the throwing version from `Training`, so it stays abstract. Only `AerobicSession` and `PowerSession` provide a real implementation.

* **AerobicSession extends BaseSession**
  * Adds `duration`, `speed`, `difficulty`, `incline`, and `resistance`. Which of `incline`/`resistance` is used depends on `activity` (see §3.4); the unused one is `null`.
  * **Must override** `calculateEffortScore()` → calls the calorie function for its `activity` from §3.4 (simulated calorie burn).

* **PowerSession extends BaseSession**
  * Adds `muscleGroup` (body part), `reps`, `sets`, `weight`. `muscleGroup` is **pre-filled from the catalog item** when the session is created, and the user can change it.
  * **Must override** `calculateEffortScore()` → `sets * reps * weight`.

### 3.3 Persistence Rules
* **Rehydration:** every class has a `static fromJSON(obj)`. `BaseSession.fromJSON` picks `AerobicSession` or `PowerSession` based on `obj.type`. After the DB loads, all data in memory is class instances, never plain objects.
* **ID counters after restart:** after loading the DB, set each `idCounter` to `max(existing ids) + 1` (or `1` if there are none), so IDs are never reused.
* **Effort score:** a unitless "effort score" used for sorting and stats, rounded to 1 decimal (`Math.round(x * 10) / 10`). Aerobic scores are kcal and Power scores are kg-volume, so the two aren't comparable units; this is accepted and should be noted in the README.

### 3.4 Aerobic Calorie Formulas (`utils/calories.js`)
The formulas estimate average calorie burn from the session's own data: speed, time, and incline or resistance. They are based on the ACSM metabolic equations, which estimate oxygen use (VO2) and convert it to calories.

**Shared definitions**
| Symbol | Meaning |
|--------|---------|
| `BW` | `REFERENCE_BODY_WEIGHT_KG = 70`, an exported constant (users have no body-weight field) |
| `S` | speed in m/min = `speed × 1000 / 60` |
| `G` | incline as a fraction = `incline / 100` |
| `R` | resistance level (1–10) |
| `VO2` | oxygen cost in ml/kg/min (per-activity formula below) |

**Calories:** `kcal = duration × (VO2 × BW / 1000) × 5`. VO2 × BW / 1000 gives litres of oxygen per minute, and the body burns about 5 kcal per litre of oxygen.

| `activity` | Uses | VO2 formula (ml/kg/min) | Function |
|------------|------|-------------------------|----------|
| `walking` | speed, incline | `3.5 + 0.1·S + 1.8·S·G` (ACSM walking) | `calcWalkingKcal({ duration, speed, incline })` |
| `running` | speed, incline | `3.5 + 0.2·S + 0.9·S·G` (ACSM running) | `calcRunningKcal({ duration, speed, incline })` |
| `cycling` | speed, resistance | `7 + 10.8·W / BW`, where simulated power `W = 10·R + 5·speed` (watts) | `calcCyclingKcal({ duration, speed, resistance })` |
| `elliptical` | speed, resistance | `3.5 + 0.15·S·(1 + 0.08·R)` | `calcEllipticalKcal({ duration, speed, resistance })` |
| `rowing` | speed, resistance | `3.5 + 0.10·S·(1 + 0.10·R)` | `calcRowingKcal({ duration, speed, resistance })` |
| `other` | speed | `kcal = duration × (speed × 0.85)` (the original formula; no VO2 step) | `calcGenericKcal({ duration, speed })` |

* `calculateAerobicKcal(session)` routes to the right function by `activity`. Unknown activities fall back to `calcGenericKcal`.
* Every function returns a value rounded to 1 decimal.
* `difficulty` is a descriptive label only and doesn't affect the result.

**Reference values.** These must match exactly and are used in the tests:
| Input | Expected kcal |
|-------|---------------|
| walking, 5 km/h, 0 % incline, 40 min | 165.7 |
| running, 10 km/h, 0 % incline, 20 min | 257.8 |
| running, 8 km/h, 5 % incline, 20 min | 253.2 |
| cycling, 15 km/h, resistance 5, 30 min | 276.0 |
| elliptical, 8 km/h, resistance 5, 40 min | 441.0 |
| rowing, 10 km/h, resistance 4, 20 min | 187.8 |
| other, 10 km/h, 30 min | 255.0 |

### 3.5 Calorie Burn Option (Aerobic Exercises)
* When admins and superadmins add or edit an **Aerobic** catalog exercise, they can turn on **Include calorie burn**. It is stored on the catalog item as `includeCalories` (boolean, default `false`). Power exercises can't use it: their `includeCalories` is always `false`.
* When a session is logged, it copies `includeCalories` from the catalog item, just like `type`, `name` and `activity`. Turning the option on or off later doesn't change sessions already logged (§8).
* An `AerobicSession` whose `includeCalories` is `true` adds `calories` to its JSON: the estimated burn in kcal from §3.4 (`calculateAerobicKcal(this)`, rounded to 1 decimal). Every other session has `calories: null`.
* The server computes `calories`, just as it computes `effortScore`. The client only displays it and never repeats the formulas.

---

## 4. Data Dictionary & Validation
The server validates every write in `middlewares/validation/validate.js`. The client checks the same rules inline before sending.
Numeric inputs may arrive as either a String or a Number. Convert them with `Number()` and reject `NaN`.

| Field | Type / Format | Rule |
|-------|---------------|------|
| `name` (user) | string | 2–50 chars, trimmed, unique (case-insensitive) |
| `tel` | string | Israeli mobile `05X-XXXXXXX` (`/^05\d-?\d{7}$/`) |
| `password` | string | ≥ 4 chars on input; stored only as a bcrypt hash |
| `role` | enum | `superadmin` \| `admin` \| `user` |
| `type` | enum | `Power` \| `Aerobic` |
| `name` (exercise) | string, **free text** | 2–50 chars, trimmed, unique per `type` (case-insensitive) |
| `activity` | enum (Aerobic catalog items only) | `running` \| `walking` \| `cycling` \| `elliptical` \| `rowing` \| `other` |
| `includeCalories` | boolean (JSON `true` / `false` only) | Catalog items only (§3.5). Optional: `false` when left out of a POST; the stored value stays when left out of a PUT. `true` is allowed only when `type` is `Aerobic`, otherwise 400 |
| `date` | `YYYY-MM-DD` | valid date, not in the future |
| `duration` | number, minutes | 1–600 |
| `speed` | number, km/h | **0.1–15.5** |
| `incline` | number, % grade | 0–15. Required for `running`/`walking`, must be `null` otherwise |
| `resistance` | integer, level | 1–10. Required for `cycling`/`elliptical`/`rowing`, must be `null` otherwise |
| `difficulty` | enum | `easy` \| `medium` \| `hard` |
| `muscleGroup` (catalog, Power) | string | A value from the stored options list (`options.json`, see §5), **or** a custom "Other" value matching `/^[A-Za-z -]{2,30}$/` (**English letters, spaces and hyphens only**, for every role). Stored trimmed and lowercased |
| `muscleGroup` (session) | string | A value from the options list, or the catalog item's own `muscleGroup` |
| muscle-group option (`value`) | string | `/^[A-Za-z -]{2,30}$/` (English only), trimmed and lowercased, not already in the list (case-insensitive) → otherwise 409 |
| `reps`, `sets` | integer | 1–1000 |
| `weight` | number, kg | 0–500 (0 = bodyweight) |

A session's `type` and `activity` must match the catalog item it refers to, and they **can't be changed after creation**. The same holds for the `includeCalories` value a session copies (§3.5). A catalog item's `type` can't be changed either; editing it can change only `name` and `activity` (Aerobic) or `muscleGroup` (Power), plus `includeCalories` on Aerobic items.

---

## 5. Databases (Server-Side JSON)
* **Users DB (`server/db/users.json`):** an array of users. Each user includes the `password` hash, `role`, and their own `sessions` array.
* **Trainings Catalog DB (`server/db/trainings.json`):** an array of catalog exercises (`id`, `type`, `name`, `activity`, `muscleGroup`, `includeCalories`).
* **Options DB (`server/db/options.json`):** `{ "muscleGroups": ["chest", "back", "legs", "shoulders", "arms", "core"] }`.
  * This is the shared muscle-group list behind every muscle-group `<select>`.
  * New values are appended **by a superadmin only**, through `POST /api/options/muscle-groups`.
  * The six built-in values can never be removed.
* **DB location:** `utils/db.js` reads the folder from `process.env.DB_DIR` (default `server/db`) on every call, so the tests can point it at a temporary copy.
* **Seed bootstrap:** on startup, if a stored `password` is not a bcrypt hash (doesn't start with `$2`), hash it (salt rounds = 10) and write the file back. This lets the seed file contain `1234` / `admin123` in plain text only until the first run.
* **Safe writes:** all writes go through a single `writeDB(file, data)` helper using `fs/promises`. It writes to `<file>.tmp` and then `rename()`s it over the original, so a crash in the middle of a write can't corrupt the JSON.
* The catalog is seeded with at least 3 Power exercises and one Aerobic exercise per `activity`.

---

## 6. Authentication & Middlewares
* **Login:** `bcryptjs.compare` against the stored hash. Use the same error message for "unknown user" and "wrong password".
* **Token:** a JWT signed with `process.env.JWT_SECRET` (with a hard-coded fallback for development only). Payload: `{ userId, role, name }`. Expires in **2h**.
* **Transport:** the header `Authorization: Bearer <token>`.
* **Middlewares**, split by category:
  | File | Exports | Purpose |
  |------|---------|---------|
  | `middlewares/auth/authenticate.js` | `authenticateToken` | Verifies the JWT and sets `req.user` |
  | `middlewares/roles/authorize.js` | `requireSuperAdmin`, `requireAdminOrSuperAdmin` | Role checks |
  | `middlewares/ownership/ownership.js` | `verifyUserOwnership`, `requireSelf`, `requireOwnerOrSuperAdmin` | Read: owner or admin/superadmin. Create: owner only. Edit/delete session: owner (any role) or superadmin |
  | `middlewares/validation/validate.js` | `validateRegister`, `validateCreateUser`, `validateTraining` (POST and PUT), `validateSession`, `validateMuscleGroupOption` | §4 rules → 400 |
* **Status codes:**
  | Code | Meaning |
  |------|---------|
  | 400 | Validation error |
  | 401 | Missing, invalid, or expired token / bad credentials |
  | 403 | Authenticated, but the role or ownership doesn't allow the action |
  | 404 | Resource not found |
  | 409 | Duplicate (user name, exercise name, muscle-group option) |
* **Error body:** always `{ "error": "<human-readable message>" }`.

---

## 7. Client Token Lifecycle
* Browser storage (`localStorage`, `sessionStorage`, cookies) is forbidden, so the JWT lives **only in a JavaScript variable**.
* **Accepted behavior:** a page refresh logs the user out.
* On any `401` response, the client clears the token and shows the login screen again.
* **Logout** clears the token variable and returns to the login screen.

---

## 8. REST API Reference
Base URL: `http://localhost:3000`. All bodies are JSON. No response ever includes `password`.
Each group of routes is an `express.Router()` in `server/routes/`. The sessions router is created with `{ mergeParams: true }` and mounted at `/api/users/:userId/sessions`.

| Router file | Method | Path | Middleware | Body | Success |
|-------------|--------|------|------------|------|---------|
| `auth.routes.js` | POST | `/api/auth/register` | validateRegister | `{ name, tel, password }` | 201 `{ token, user }` |
| `auth.routes.js` | POST | `/api/auth/login` | — | `{ name, password }` | 200 `{ token, user }` |
| `users.routes.js` | GET | `/api/users` | authenticate, requireAdminOrSuperAdmin | — | 200 `User[]` (with sessions) |
| `users.routes.js` | GET | `/api/users/:userId` | authenticate, verifyUserOwnership | — | 200 `User` (with sessions) |
| `users.routes.js` | POST | `/api/users` | authenticate, requireAdminOrSuperAdmin, validateCreateUser | `{ name, tel, password, role }` | 201 `User` |
| `users.routes.js` | DELETE | `/api/users/:userId` | authenticate, requireSuperAdmin | — | 204 |
| `trainings.routes.js` | GET | `/api/trainings` | authenticate | — | 200 `Training[]` |
| `trainings.routes.js` | POST | `/api/trainings` | authenticate, requireAdminOrSuperAdmin, validateTraining | `{ type, name, activity? , muscleGroup?, includeCalories? }` | 201 `Training` |
| `trainings.routes.js` | PUT | `/api/trainings/:id` | authenticate, requireAdminOrSuperAdmin, validateTraining | `{ name, muscleGroup }` (Power) or `{ name, activity, includeCalories? }` (Aerobic). No `type` | 200 `Training` |
| `trainings.routes.js` | DELETE | `/api/trainings/:id` | authenticate, requireSuperAdmin | — | 204 |
| `options.routes.js` | GET | `/api/options/muscle-groups` | authenticate | — | 200 `string[]` |
| `options.routes.js` | POST | `/api/options/muscle-groups` | authenticate, requireSuperAdmin, validateMuscleGroupOption | `{ value }` | 201 `string[]` (updated list) |
| `sessions.routes.js` | POST | `/api/users/:userId/sessions` | authenticate, requireSelf, validateSession | `{ trainingId, date, …type fields }` | 201 `Session` |
| `sessions.routes.js` | PUT | `/api/users/:userId/sessions/:sessionId` | authenticate, requireOwnerOrSuperAdmin, validateSession | type-specific fields (not `type`/`activity`/`includeCalories`) | 200 `Session` |
| `sessions.routes.js` | DELETE | `/api/users/:userId/sessions/:sessionId` | authenticate, requireOwnerOrSuperAdmin | — | 204 |

Type-specific session fields:
* **Aerobic:** `duration`, `speed`, `difficulty`, plus `incline` or `resistance` as the catalog item's `activity` requires.
* **Power:** `muscleGroup`, `reps`, `sets`, `weight`.

Route rules:
* `POST /api/users` returns 403 when an admin tries `role: 'admin'`, and 400 for `role: 'superadmin'`.
* `DELETE /api/users/:userId` returns 400 when superadmins try to delete themselves.
* `PUT /api/trainings/:id` returns 400 if the body contains a different `type`, and 404 for an unknown id.
* `PUT` and `DELETE` on `/api/trainings/:id` **don't change sessions already logged** against that exercise, because each session stores its own copy of `type`, `name`, `activity`, `muscleGroup` and `includeCalories`.
* `POST /api/options/muscle-groups` is **superadmin-only**. Admins and users get 403. It returns 409 if the value already exists (case-insensitive), and 400 for non-English text.
* Saving an exercise with a custom `muscleGroup` does **not** add it to the options list. That only happens through the explicit `POST /api/options/muscle-groups` call (see §9).
* `includeCalories` (§3.5) can be set only through `POST` and `PUT` on `/api/trainings`, so only admins and superadmins can change it. `true` on a Power exercise returns 400.
* A returned `Session` has: `sessionId`, `trainingId`, `type`, `name`, `activity`, `date`, the type-specific fields, `includeCalories`, `calories` (kcal or `null`, see §3.5), and `effortScore`.

---

## 9. UI/UX Features
* **Register & Login:** a glassmorphic screen shown at launch with Login/Register tabs. The dashboard stays hidden until the user authenticates. The header shows the current user's name, role badge, and a Logout button.
* **Add (Form):** pick the type, then pick an exercise from the catalog filtered by that type. Only the inputs relevant to that choice are shown:
  * **Aerobic:** duration, speed (`max="15.5"`, `step="0.1"`), difficulty, plus **incline** for running/walking or **resistance** for cycling/elliptical/rowing.
  * **Power:** muscleGroup, reps, sets, weight.

  Admins and superadmins also get a **Create User** form and the **Add / Edit Exercise** form described next.
* **Add / Edit Exercise (catalog; admin & superadmin only):**
  * **Fields:**
    * **Type:** `<select>`. Read-only when editing.
    * **Name:** `<input type="text">`, free text.
    * **Activity:** `<select>`, shown when the type is Aerobic.
    * **Include calorie burn:** `<input type="checkbox">`, shown only when the type is Aerobic (§3.5). Unchecked by default; when editing, it shows the stored value. Switching the type to Power hides and unchecks it.
    * **Muscle group:** `<select>`, shown when the type is Power. Options come from `GET /api/options/muscle-groups`, with **"Other…"** as the last option.
  * **"Other…" behavior:** choosing "Other…" reveals a text input right below the select. That input is required and validated inline (§4).
    * The text must be **English letters, spaces or hyphens only**, for every role. Anything else shows the inline error *"Use English letters only."*
    * Choosing any other option hides the text input and clears it.
  * **Edit:** each catalog item shows an **Edit** button (admins & superadmins). It opens the same form pre-filled, and Save calls `PUT /api/trainings/:id`. If the item's `muscleGroup` isn't in the options list, the form pre-selects "Other…" with the text field filled in.
  * **Admin:** a new "Other…" value is saved on the exercise only. **No prompt appears.** Instead, an inline note reads: *"Saved for this exercise only. Only a Super Admin can add it to the shared list."*
  * **"Add to the list?" prompt (superadmin only):** after a **successful** save (add or edit) where "Other…" held a value that isn't in the list yet, and the logged-in user is a **superadmin**, show an **inline** prompt next to the form. It is a DOM element, never `confirm()`:
    > Add "**forearms**" to the muscle group list for future use?  **[Yes] [No]**
    * **Yes** → `POST /api/options/muscle-groups`, then re-render every muscle-group select with the new option.
    * **No** → close the prompt. The value stays only on this exercise.
    * If the typed text matches an existing option (case-insensitive), the existing option is used and **no prompt** is shown.
* **Select controls:** fields with a fixed set of values are always a `<select>`, never free text. That covers `muscleGroup`, `difficulty`, `activity`, `type`, and `role`. The on/off `includeCalories` option is a checkbox, not a select.
  * Options come from the same arrays used in validation. For `muscleGroup`, that means the stored options list.
  * This applies in the Add forms and the inline edit.
  * Only the catalog form's muscle-group select has "Other…". The session form and the filter bar don't.
  * The Filter bar's `muscleGroup` and type selects start with an extra **"All"** option. The muscle-group filter also lists any custom values that appear in the current data.
* **See (List):** sessions are rendered as cards. A card renders only the fields for its type. Any field that is empty or `null` (for example `incline` on a cycling session) gets the class `.hidden` (`display: none`). For admins and superadmins, cards also show the owner's name. When `calories` isn't `null`, the card shows it as "≈ X kcal".
* **Edit & Delete:** cards can be edited inline (fields become inputs/selects, with Save and Cancel; `type` and `activity` stay read-only). Delete asks for an **inline** confirmation (no `confirm()`/`alert()`). Edit and Delete buttons are rendered only when §2.2 allows them.
* **Filter & Search:** real-time filters that can be combined: type, muscle group (`<select>`; only applies when type ≠ Aerobic), and a case-insensitive name search.
* **Sort:** ascending or descending by date, name, and effort score. Sorting is applied after filtering.
* **See Stats:** four summary cards that recalculate after every data change:
  1. **Total Users** (admins), or **My Total Workouts** (user)
  2. **Max Weight Lifted** (kg)
  3. **Average Aerobic Time** (minutes, 1 decimal)
  4. **Total Power Workouts**

  Admins and superadmins see stats over all users. A regular user sees only their own.
* **Get Insights:** at least 4 dynamic, calculated sentences, for example:
  * "Your most trained muscle group is **legs** (6 sessions)."
  * "Your longest aerobic session was **Running** — 45 min on 2026-09-30."
  * "You logged **5** workouts in the last 7 days."
  * "You burned an estimated **1,240 kcal** in aerobic sessions this week."

  Calorie figures add up only sessions whose `calories` isn't `null` (§3.5). When there is no data, show a friendly fallback message instead of `NaN`/`undefined`.
* **Feedback:** all errors (validation and server) appear as inline text next to the related form or card. `alert()` is never used.

---

## 10. Technical Constraints (STRICT)
* **Allowed tech:** HTML, CSS, Vanilla JavaScript, Node.js (v20+), Express, `cors`, `bcryptjs`, `jsonwebtoken`. Testing uses only Node's built-in `node:test` and `node:assert`.
* **Prohibited tech:** React, Vue, Angular, jQuery, Bootstrap, Tailwind, or any other client-side library or framework. No third-party test libraries (Jest, Mocha, Supertest, etc.).
* **No browser storage:** `localStorage`, `sessionStorage`, and cookies are forbidden. All persistent state is saved to the backend JSON files.
* **HTML/CSS:** semantic HTML (`header`, `main`, `section`, `article`, `form`, `label`), Flexbox, and CSS Grid. Responsive breakpoints: mobile ≤ 600px, tablet 601–1024px, desktop > 1024px.
* **JavaScript (client):** use array methods (`map`, `filter`, `reduce`, `some`, `every`, `sort`). Use `fetch` with `async/await`.
* **Node.js server:**
  * `express`, `cors()`, `express.json()`, port **3000**.
  * `express.static` serves `client/`, so the app opens at `http://localhost:3000`.
  * Data persistence uses `fs/promises`.
  * `server.js` only wires middlewares and routers together. It exports `app` and calls `app.listen` only when `require.main === module`, so the tests can start it on their own port.

---

## 11. Coding Conventions
* **Code documentation rule:** put all explanations and logical breakdowns as comments inside the code. Don't write separate paragraphs explaining the code.
* Use ES6 classes, `const`/`let` (never `var`), and `async/await`. Every route handler is wrapped in `try/catch` and returns `500 { error }` on unexpected failures.
* Server modules use CommonJS (`require`/`module.exports`). Every function the spec names is exported so it can be tested.
* Client `script.js` keeps pure logic (no DOM access) in standalone functions: `toNumber`, `validateSessionInput`, `filterSessions`, `sortSessions`, `computeStats`, `buildInsights`, plus:
  * `buildMuscleGroupOptions(list, { withOther })` → `[{ value, label }]`. Adds `{ value: '__other__', label: 'Other…' }` when `withOther` is true.
  * `resolveMuscleGroupInput(selectValue, otherText, list)` → `{ value, isNew }`. Trims and lowercases the input. `isNew` is `true` only when "Other…" text isn't already in `list` (case-insensitive).
  * `shouldOfferAddToList(isNew, role)` → `isNew && role === 'superadmin'`. This decides whether the "Add to the list?" prompt appears.
  * DOM code runs only inside `if (typeof document !== 'undefined')`.
  * The file ends with `if (typeof module !== 'undefined') module.exports = { … }`, so Node can `require` it in tests.
* Keep the names used in this spec exactly as written (classes, fields, functions, middleware, routes, files).

---

## 12. Folder Structure
The generated code must match this tree exactly:
```text
project-2/
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server/
│   ├── server.js                  ← app setup: cors, json, static, mounts routers; exports app
│   ├── package.json               ← scripts: "start": "node server.js", "test": "node --test tests/system.test.js"
│   ├── package-lock.json
│   ├── db/
│   │   ├── users.json
│   │   ├── trainings.json
│   │   └── options.json           ← shared muscle-group list
│   ├── models/
│   │   ├── User.js
│   │   ├── Training.js
│   │   └── Session.js             ← BaseSession, AerobicSession, PowerSession
│   ├── utils/
│   │   ├── db.js                  ← readDB, writeDB, loadAll, bootstrapSeedPasswords
│   │   └── calories.js            ← §3.4 formulas + REFERENCE_BODY_WEIGHT_KG
│   ├── middlewares/
│   │   ├── auth/
│   │   │   └── authenticate.js
│   │   ├── roles/
│   │   │   └── authorize.js
│   │   ├── ownership/
│   │   │   └── ownership.js
│   │   └── validation/
│   │       └── validate.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── trainings.routes.js
│   │   ├── sessions.routes.js
│   │   └── options.routes.js
│   └── tests/
│       └── system.test.js         ← run with: npm run test
├── README.md        ← setup (npm install, npm start, npm run test), roles & default credentials, effort-score note
├── SPEC.md          ← this file
├── AI-LOG.md        ← prompts used and decisions the AI made
└── TESTS-LOG.md     ← npm run test output + manual checklist results (§14)
```

---

## 13. Automated Tests (`server/tests/system.test.js`)
* **Run:** `cd server && npm run test` (`node --test tests/system.test.js`). Must exit with code 0.
* **Tools:** `node:test` (`describe`, `it`, `before`, `after`) and `node:assert/strict`. Nothing else.
* **Coverage rule:** **every function in the system has at least one test**: every exported server function, every class method, and every client pure function. If you add a function, you add a test for it.
* **Isolation:**
  * In `before()`, copy `db/*.json` into a temp folder (`fs.mkdtemp(os.tmpdir())`) and set `process.env.DB_DIR` to it *before* requiring `server.js`.
  * Start `app.listen(0)` and use the global `fetch` against the assigned port.
  * In `after()`, close the server and delete the temp folder. The real `db/` files are never modified.

| Test group | What it must check |
|------------|--------------------|
| **Models** | `calculateEffortScore()` on a `Training` and on a `BaseSession` instance throws (`assert.throws`, message contains `must be overridden`); `idCounter` increments; separate counters for catalog and sessions; `fromJSON` returns the correct subclass; `User.toJSON()` has no `password`; `PowerSession.calculateEffortScore()` = `sets*reps*weight`; `AerobicSession.calculateEffortScore()` delegates by `activity`; `includeCalories` is copied from the catalog item to the session, and `AerobicSession` JSON has `calories` equal to its §3.4 kcal when `includeCalories` is `true`, `null` otherwise (`PowerSession` always `null`) |
| **Calories** | Every function in `calories.js` matches the §3.4 reference values; unknown activity falls back to the generic formula; result has 1 decimal |
| **DB utils** | `readDB`/`writeDB` round-trip; no `.tmp` file left behind; counters reseeded to `max + 1`; `bootstrapSeedPasswords` hashes plaintext and leaves hashes unchanged |
| **Validation** | One pass case and at least one fail case per field in §4, including `speed: 15.5` passes, `speed: 16` fails, `"12"` string accepted, `"abc"` rejected, a missing `incline` for running fails, and a custom muscle group `"Forearms"` passes while `"x"`, `"<script>"` and the Hebrew `"כתפיים"` fail. Also `includeCalories`: `true`/`false` pass for an Aerobic item, a non-boolean such as `"yes"` fails, and `true` fails for a Power item |
| **Middlewares** | Each middleware called with mock `req`/`res`/`next`: calls `next()` when allowed, otherwise the correct 401/403 status |
| **API routes** | Every row in §8: success status plus at least one denied/invalid case; no response body contains `password`. Also: `PUT /api/trainings/:id` (admin & superadmin 200, user 403, changing `type` 400, existing sessions unchanged); options GET 200; POST superadmin 201, **admin 403**, user 403, duplicate 409 (case-insensitive), non-English 400; saving an exercise with a custom muscle group does **not** change `options.json`; `includeCalories` on `POST`/`PUT /api/trainings` (admin & superadmin succeed, user 403, `true` on Power 400), sessions logged after it is turned on return `calories`, and turning it on or off doesn't change sessions already logged |
| **RBAC** | One test per row of the §2.2 matrix, including **admin deletes own session → 204** and **admin deletes another user's session → 403** |
| **Client logic** | `require('../../client/script.js')`: `toNumber`, `validateSessionInput`, `filterSessions` (combined filters), `sortSessions` (both directions, all 3 keys), `computeStats` (admin vs. user scope, empty data), `buildInsights` (≥ 4 sentences, no `NaN`/`undefined`, kcal figures only from sessions whose `calories` isn't `null`), `buildMuscleGroupOptions` (with and without "Other…"), `resolveMuscleGroupInput` (existing option → `isNew: false`; new text → `isNew: true`; `"LEGS "` via Other → `{ value: 'legs', isNew: false }`), `shouldOfferAddToList` (superadmin + new → `true`; admin + new → `false`; superadmin + existing → `false`) |

---

## 14. Acceptance Criteria / Manual Checklist
Record each item as Pass/Fail in `TESTS-LOG.md`, together with the `npm run test` summary.

**Automated**
- [ ] `npm run test` passes with 0 failures, and every exported function appears in at least one test.

**Auth**
- [ ] Register creates a `user` and returns a token. A duplicate name returns 409.
- [ ] Login with a wrong password returns 401 with a generic message.
- [ ] Seed passwords are bcrypt hashes in `users.json` after the first start.
- [ ] No API response contains `password`.
- [ ] A request without a token returns 401. A page refresh returns to the login screen.

**RBAC** (one check per row of §2.2)
- [ ] A user can't reach `GET /api/users` or another user's `/api/users/:id` (403).
- [ ] An admin can create a `user`, but gets 403 for an `admin`. A superadmin can create an `admin`.
- [ ] An admin can add **and edit** an exercise, but gets 403 deleting an exercise, a user, or another user's session.
- [ ] A user gets 403 on `PUT /api/trainings/:id` and sees no Edit button in the catalog.
- [ ] A user **and an admin** get 403 on `POST /api/options/muscle-groups`. A superadmin gets 201.
- [ ] An admin **can delete their own session** (204), and the Delete button shows on their own cards.
- [ ] A user can delete their own session, and gets 403 on someone else's.
- [ ] A superadmin can delete any session, exercise, or user, but not themself (400).
- [ ] The UI hides the buttons for actions a role can't perform.
- [ ] An admin and a superadmin can turn **Include calorie burn** on and off for an Aerobic exercise. A user can't (403).

**Data model**
- [ ] `calculateEffortScore()` throws on `Training`/`BaseSession` and is overridden in both session subclasses.
- [ ] Session IDs and catalog IDs are independent. IDs keep increasing after a server restart.
- [ ] Aerobic calories match the §3.4 reference table for every activity. Power score = `sets * reps * weight`.
- [ ] Invalid inputs (for example `reps: "abc"`, `speed: 16`, or a future date) return 400 and show an inline error.
- [ ] Sessions of an Aerobic exercise with **Include calorie burn** on carry `calories` equal to their §3.4 kcal; all other sessions have `calories: null`. Turning the option on or off doesn't change sessions already logged.

**UI**
- [ ] The Add form switches its inputs when the type changes, and shows incline or resistance depending on the activity.
- [ ] `muscleGroup`, `difficulty`, `activity`, `type` and `role` are `<select>` elements in every form and in inline edit.
- [ ] The speed input does not accept values above 15.5.
- [ ] Add/Edit Exercise: the name is free text. Choosing "Other…" in the muscle-group select shows a text field, and choosing another option hides and clears it.
- [ ] Non-English text (for example Hebrew) in "Other…" shows "Use English letters only." and the server returns 400.
- [ ] As an **admin**, saving with a new "Other…" value shows the "Saved for this exercise only…" note, with no prompt.
- [ ] As a **superadmin**, saving with a new "Other…" value shows the inline "Add to the list?" prompt. **Yes** → the option appears in every muscle-group select, including after a reload. **No** → the list is unchanged, but the exercise keeps the value.
- [ ] Typing an existing option (for example "Legs") under "Other…" uses it with no prompt.
- [ ] Editing an exercise whose muscle group isn't in the list opens with "Other…" pre-selected and filled in.
- [ ] Editing an exercise doesn't change sessions already logged against it.
- [ ] Filters combine correctly. Sorting works in both directions for date, name, and effort.
- [ ] Inline edit saves and persists. Inline delete confirmation works.
- [ ] All 4 stats and at least 4 insights update after every change and handle empty data.
- [ ] The layout works at 375px, 768px, and 1280px widths.
- [ ] No `localStorage`/`sessionStorage`/`document.cookie`/`alert(` appears in `client/` (grep).
- [ ] The **Include calorie burn** checkbox appears in the exercise form only for Aerobic exercises, and cards of sessions logged with it on show "≈ X kcal".
