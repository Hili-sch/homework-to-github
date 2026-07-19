# PulseFit - Gym Training Tracker Dashboard

PulseFit is a modern, premium Gym Training Tracker application built using a full-stack Vanilla JavaScript and Node.js/Express architecture. It implements rich Object-Oriented Programming (OOP) design patterns and persists data server-side in simple JSON databases without utilizing client-side browser storage.

## Architecture

- **Backend**: Node.js and Express server running on port 3000. Handles file-based data operations with safety guards (`fs/promises`).
- **Frontend**: Single-page application styled using a dark glassmorphic design language. Structured with semantic HTML5 elements and styled with flexible CSS layouts (CSS Grid + Flexbox).
- **OOP Inheritance**:
  - `User`: Manages user profile fields and array of workout sessions.
  - `BaseTraining`: Represents catalog-level exercises (type Power or Aerobic).
  - `BaseSession`: Inherits from `BaseTraining` and adds a `date` and `sessionId`.
  - `AerobicSession`: Extends `BaseSession`. Tracks `duration` and `speed`. Implements `calculateEffortScore()`.
  - `PowerSession`: Extends `BaseSession`. Tracks `muscleGroup`, `reps`, `sets`, and `weight`. Overrides `calculateEffortScore()`.

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
4. Open the client dashboard in your browser by opening `client/index.html` directly or running a local development server.

## Features

- **Dynamic Workouts Logging**: Forms adjust input elements depending on whether the catalog exercise type is Power or Aerobic.
- **Combined Filtering**: Real-time combined filtering by search query, exercise type, and targeted muscle group.
- **Interactive Management**: Full capabilities to add new users, update active session attributes (inline dialog), delete items, and extend the exercise catalog.
- **Stats Dashboard**: Live statistics summary calculating total system users, max lifting load, aerobic session averages, and power exercise volumes.
- **Computed Insights**: Performance feedback panels rendering computed training stats and advice based on logged patterns.
