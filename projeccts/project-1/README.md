# PulseFit - Gym Training Tracker Dashboard (Secure Auth & RBAC Edition)

PulseFit is a modern, premium Gym Training Tracker application built using a full-stack Vanilla JavaScript and Node.js/Express architecture. It implements rich Object-Oriented Programming (OOP) design patterns, Role-Based Access Control (RBAC), and password-based authentication using JWT and Bcrypt. Data is persisted server-side in simple JSON databases without utilizing client-side browser storage.

## Architecture

- **Backend**: Node.js and Express server running on port 3000. Handles file-based data operations with safety guards (`fs/promises`).
- **Security & RBAC**:
  - `bcryptjs` is used to securely hash passwords in `db/users.json` on user creation.
  - `jsonwebtoken` (JWT) is used to sign and verify secure stateless authentication tokens.
  - **Super Admin (`Hilli Schlesinger`, password `1234`)**: Full read/write/delete privileges across all users, catalog exercises, and workout sessions.
  - **Staff Admin (`Staff Admin`, password `admin123`)**: Can read all profiles, create users, and add catalog exercises. No delete permissions.
  - **Regular User (password `password123`)**: Can view, log, edit, and delete their own sessions only. Blocked from listing other users or modifying the exercise catalog.
- **Frontend**: Single-page application styled using a dark glassmorphic design language. Structured with semantic HTML5 elements and styled with flexible, balanced CSS layouts (CSS Grid + Flexbox).
- **OOP Inheritance**:
  - `User`: Manages user profile fields, role classification, password, and array of workout sessions.
  - `BaseTraining`: Represents catalog-level exercises (type Power or Aerobic).
  - `BaseSession`: Inherits from `BaseTraining` and adds a `date` and `sessionId`.
  - `AerobicSession`: Extends `BaseSession`. Tracks `duration` and `speed`. Implements `calculateEffortScore()` representing a simulated calorie burn: `duration * (speed * 0.85)`.
  - `PowerSession`: Extends `BaseSession`. Tracks `muscleGroup`, `reps`, `sets`, and `weight`. Overrides `calculateEffortScore()`: `sets * reps * weight`.

## Installation & Getting Started

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express backend:
   ```bash
   npm start
   ```
4. Open the client dashboard in your browser at:
   **[http://localhost:3000](http://localhost:3000)** (or open `client/index.html` directly in the browser).

## Features

- **JWT Auth & Password Registration**: Beautiful glassmorphic login screen overlay. Secure stateless token-based API calls.
- **Role-Based Adaptation**: UI widgets (switcher dropdown, catalog addition, delete buttons) toggle dynamically depending on the user's logged-in role.
- **Dynamic Workouts Logging**: Forms adjust input elements depending on whether the catalog exercise type is Power or Aerobic.
- **Calorie Burn Simulation**: Realistic calorie calculations utilizing running duration and speed relations.
- **Empty Fields Protection**: CSS `display: none` rules hide unused workout details dynamically.
- **Combined Filtering**: Real-time combined filtering by search query, exercise type, and targeted muscle group.
- **Interactive Management**: Full capabilities to add users, update active session attributes (inline dialog), delete items, and extend the exercise catalog.
- **Stats Dashboard**: Live statistics summary calculating total system users, max lifting load, aerobic session averages, and power exercise volumes.
- **Computed Insights**: Performance feedback panels rendering computed training stats and advice based on logged patterns.
