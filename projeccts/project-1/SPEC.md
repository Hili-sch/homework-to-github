# AI System Prompt & Project Specification: Fitness Tracker Dashboard (Auth & RBAC Update)

**Objective:** Develop a full-stack, Vanilla JavaScript fitness tracking dashboard with Role-Based Access Control (RBAC) and password authentication. You are acting as an AI coding assistant. You must adhere strictly to the following architectural, technical, and formatting guidelines. 

## 1. Domain & Scope
*   **Domain:** Gym Training Tracker. 
*   **Core Concept:** The application tracks users and two types of workout sessions: **Power** and **Aerobic**. It supports registration, login, and different access roles.

## 2. OOP, Authentication, & Database Architecture
Implement the data models using standard ES6 Classes. The server must manage two separate databases.

### A. Databases (Server-Side)
*   **Users DB (`db/users.json`):** Stores user profiles (with `password` hashes and `role` fields) and their personal array of logged training sessions.
*   **Trainings Catalog DB (`db/trainings.json`):** Stores the general catalog of available exercises.

### B. Role-Based Access Control (RBAC) Roles
*   **Super Admin (`role: 'superadmin'`)**:
    *   User named "Hilli Schlesinger" (default password `1234`).
    *   Has access to view all users' profiles and all workout sessions.
    *   Only the Super Admin can delete sessions, delete users, or add/delete exercise catalog items.
*   **Admin (`role: 'admin'`)**:
    *   User named "Staff Admin" (default password `admin123`).
    *   Has access to view all users' profiles and all sessions.
    *   Can add new exercises to the catalog and register new users, but has **no delete privileges** anywhere.
*   **Regular User (`role: 'user'`)**:
    *   Access is restricted only to their own profile and sessions.
    *   Can log, update, and delete their own workout sessions.
    *   Cannot add/delete exercises in the catalog or view other users.

### C. Class Definitions
*   **User Class:**
    *   Must include a `static idCounter` variable that auto-increments to assign a unique ID.
    *   Properties: `id`, `name`, `tel`, `role`, `password` (hashed), `sessions` (array of session instances).

*   **Base Training Class (Catalog Level):**
    *   Must include a `static idCounter` variable for unique catalog IDs.
    *   Properties: `id`, `type` (Power/Aerobic), `name`.

*   **Extended Session Classes (Triggered via "Add" button):**
    When a user adds a workout, instantiate an extended class that inherits from the Base Training Class and expands it with session-specific data.
    *   **Base Session:** Extends the Base Training Class by adding a `date` property.
    *   **Aerobic Session (Subclass):** Extends the Base Session. Adds `duration` (time), `speed`, and `difficulty`.
        *   Must include a method `calculateEffortScore()` representing a simulated calorie burn: `duration * (speed * 0.85)`.
    *   **Power Session (Subclass):** Extends the Base Session. Adds `muscleGroup` (body part), `reps`, `sets`, and `weight`.
        *   Must override the `calculateEffortScore()` method: `sets * reps * weight`.

*   **Code Documentation Rule:** All code explanations and logical breakdowns must be integrated directly as comments inside the code blocks themselves. Do not write external paragraphs explaining the code.

## 3. UI/UX Features
*   **Register & Login:** A secure interface (glassmorphic screen) visible on launch. Hides the dashboard until a user authenticates. Since no browser storage (localStorage/sessionStorage/cookies) is allowed, token state is held in runtime memory.
*   **Add (Form):** Log workouts. Based on the selected type, dynamically show the relevant inputs.
*   **See (List):** Render logged sessions as cards. Hidden parameters or empty parameters must be hidden using CSS `display: none`.
*   **Edit & Delete:** Workout cards must support inline editing and deletion (delete buttons are role-restricted).
*   **Filter & Search:** Real-time combinable query filters (type, muscle group, name search).
*   **Sort:** Ascending/Descending sort by date, name, and calorie burn effort score.
*   **See Stats:** Four summary cards (Total Users, Max Weight Lifted, Average Aerobic Time, Total Power Workouts).
*   **Get Insights:** At least 4 dynamic, calculated insights sentences.

## 4. Technical Constraints (STRICT)
*   **Allowed Tech:** HTML, CSS, Vanilla JavaScript, Node.js, Express, `bcryptjs`, `jsonwebtoken` (JWT).
*   **Prohibited Tech:** React, Vue, Angular, jQuery, Bootstrap, Tailwind, or any client-side libraries.
*   **No Browser Storage:** `localStorage`, `sessionStorage`, and Cookies are strictly forbidden. All state must be saved to the backend JSON files.
*   **HTML/CSS:** Semantic HTML, Flexbox, CSS Grid. Responsive across mobile, tablet, and desktop breakpoints.
*   **JavaScript (Client):** Use array methods (`map`, `filter`, `reduce`, `some`, `every`, `sort`). Handle numeric inputs whether String or Number. Inline validation showing text errors (no `alert()`).
*   **Node.js Server:** Use express, cors, express.json(). Port 3000. Data persistence via `fs/promises`. Use custom middleware directory for authentication and role authorization checks.

## 5. Folder Structure
The generated code must fit precisely into the following directory tree:
```text
my-project/
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server/
│   ├── server.js
│   ├── package.json
│   ├── db/
│   │   ├── users.json
│   │   └── trainings.json
│   └── middlewares/
│       └── auth.js
├── README.md
├── SPEC.md
├── AI-LOG.md
└── TESTS-LOG.md
```