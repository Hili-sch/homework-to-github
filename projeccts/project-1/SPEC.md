# AI System Prompt & Project Specification: Fitness Tracker Dashboard

**Objective:** Develop a full-stack, Vanilla JavaScript fitness tracking dashboard. You are acting as an AI coding assistant. You must adhere strictly to the following architectural, technical, and formatting guidelines. 

## 1. Domain & Scope
*   **Domain:** Gym Training Tracker. 
*   **Core Concept:** The application tracks users and two types of workout sessions: **Power** and **Aerobic**. 

## 2. Object-Oriented Programming (OOP) & Database Architecture
Implement the data models using standard ES6 Classes. The server must manage two separate databases.

### A. Databases (Server-Side)
*   **Users DB (`db/users.json`):** Stores user profiles and their personal array of logged training sessions.
*   **Trainings Catalog DB (`db/trainings.json`):** Stores the general catalog of available exercises.

### B. Class Definitions
*   **User Class:**
    *   Must include a `static idCounter` variable that auto-increments to assign a unique ID to new users and prevent duplicates.
    *   Properties: `id`, `name`, `tel`, `sessions` (an array to store extended training session instances).

*   **Base Training Class (Catalog Level):**
    *   Must include a `static idCounter` variable for unique catalog IDs.
    *   Properties: `id`, `type` (Power/Aerobic), `name`.

*   **Extended Session Classes (Triggered via "Add" button):**
    When a user adds a workout, instantiate an extended class that inherits from the Base Training Class and expands it with session-specific data.
    *   **Base Session:** Extends the Base Training Class by adding a `date` property.
    *   **Aerobic Session (Subclass):** Extends the Base Session. Adds `duration` (time), `speed`, and `difficulty`.
        *   Must include a method `calculateEffortScore()` (e.g., duration * speed).
    *   **Power Session (Subclass):** Extends the Base Session. Adds `muscleGroup` (body part), `reps`, `sets`, and `weight`.
        *   Must override the `calculateEffortScore()` method (e.g., sets * reps * weight).

*   **Code Documentation Rule:** All code explanations and logical breakdowns must be integrated directly as comments inside the code blocks themselves. Do not write external paragraphs explaining the code.

## 3. UI/UX Features
*   **Add (Form):** A form with a select-option to choose a base training from the catalog. Based on the selected type (Power/Aerobic), display the relevant input fields dynamically so the user can populate the Extended Session properties (date, weight, reps, speed, etc.).
*   **See (List):** Render all the user's logged training sessions as visually distinct cards.
*   **Edit & Delete:** Each session card must have functional edit and delete buttons.
*   **Filter & Search:** Inputs to filter sessions by type (Power/Aerobic), filter by muscle group, and a free-text search. Filters must be combinable.
*   **Sort:** Buttons to sort the data (e.g., alphabetically or by date) in Ascending/Descending order.
*   **See Stats:** Four summary cards (e.g., Total Users, Max Weight Lifted, Average Aerobic Time, Total Power Workouts).
*   **Get Insights:** A dedicated panel displaying at least 4 human-readable, calculated sentences based on the user's sessions (e.g., "Power workouts account for 60% of your routines").

## 4. Technical Constraints (STRICT)
*   **Allowed Tech:** HTML, CSS, Vanilla JavaScript, Node.js, Express.
*   **Prohibited Tech:** React, Vue, Angular, jQuery, Bootstrap, Tailwind, or any client-side libraries. 
*   **No Browser Storage:** `localStorage`, `sessionStorage`, and Cookies are strictly forbidden. All state must be saved to the backend JSON files.
*   **HTML/CSS:** 
    *   Use semantic HTML tags (`header`, `main`, `footer`, `section`).
    *   Implement at least one `Flexbox` layout and one `CSS Grid` layout.
    *   Use proper Box-Model (padding, borders, shadows).
    *   Must be responsive across Mobile, Tablet, and Desktop breakpoints.
*   **JavaScript (Client):**
    *   Must utilize these array methods effectively: `map`, `filter`, `reduce`, `some`, `every`, `sort`.
    *   Must use destructuring, spread operator, rest parameters, template literals, switch statements, and ternary operators.
    *   **Input Handling:** Any JavaScript function processing numerical inputs (like weights, duration, or reps) must be built to process the data successfully whether it is received as a String or a Number.
    *   Implement inline form validation showing text errors on the screen (no `alert()`).
*   **Node.js Server:**
    *   Use `express`, `cors`, and `express.json()`. Run on port 3000.
    *   Persist data by reading and writing to the respective JSON files in the `db/` folder using `fs/promises`.
    *   Wrap all endpoints in `try/catch` blocks and return a standard 500 error upon failure.

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
│   └── db/
│       ├── users.json
│       └── trainings.json
├── README.md
├── SPEC.md
├── AI-LOG.md
└── TESTS-LOG.md