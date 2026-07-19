/**
 * Fitness Tracker Dashboard - Express Backend
 * 
 * This file serves as the main application entry point, containing:
 * 1. ES6 Class definitions for User, BaseTraining, BaseSession, AerobicSession, and PowerSession.
 * 2. File-based database helper functions using Node.js fs/promises.
 * 3. Express REST API endpoints to manage users, exercise catalogs, and workout sessions.
 * 4. Error-handling middleware and server startup logic.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS so the client (running via file system or static server) can communicate with the backend
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());

// Database paths
const USERS_FILE_PATH = path.join(__dirname, 'db', 'users.json');
const TRAININGS_FILE_PATH = path.join(__dirname, 'db', 'trainings.json');

/**
 * UTILITY FUNCTIONS
 */

/**
 * Safely parse numeric input, handling string or number inputs.
 * If the input is not a number, returns 0.
 * @param {string|number} value - The input to convert.
 * @returns {number} The parsed float or integer.
 */
function safeParseNumeric(value) {
  if (value === undefined || value === null) return 0;
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Helper to read JSON data from a file.
 * Returns an empty array if the file doesn't exist or is empty.
 */
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    // If file does not exist, return empty list
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

/**
 * Helper to write JSON data to a file.
 */
async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


/**
 * OBJECT-ORIENTED PROGRAMMING (OOP) CLASS DEFINITIONS
 */

/**
 * User Class
 * Represents a person tracking their gym progress.
 */
class User {
  // Static counter to assign unique, auto-incrementing IDs to new users and prevent duplicates
  static idCounter = 1;

  constructor(id, name, tel, sessions = []) {
    // If id is not specified, assign a new auto-incremented ID and update the static counter
    if (!id) {
      this.id = User.idCounter++;
    } else {
      this.id = safeParseNumeric(id);
    }
    this.name = name;
    this.tel = tel;
    // sessions array holds instances of AerobicSession or PowerSession subclasses
    this.sessions = sessions;
  }
}

/**
 * Base Training Class (Catalog Level)
 * Defines the generic exercise category stored in the trainings catalog.
 */
class BaseTraining {
  // Static counter for catalog training unique IDs
  static idCounter = 1;

  constructor(id, type, name) {
    if (!id) {
      this.id = BaseTraining.idCounter++;
    } else {
      this.id = safeParseNumeric(id);
    }
    // Must be either 'Power' or 'Aerobic'
    this.type = type;
    this.name = name;
  }
}

/**
 * Base Session Class
 * Extends Base Training by adding a date and unique session identifier.
 */
class BaseSession extends BaseTraining {
  constructor(id, type, name, date, sessionId = null) {
    // Invoke parent constructor to populate base training properties
    super(id, type, name);
    this.date = date;
    // Generate a unique session identifier if not already provided
    this.sessionId = sessionId || `sess_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
}

/**
 * Aerobic Session Class
 * Subclass extending BaseSession to store cardio-specific data.
 */
class AerobicSession extends BaseSession {
  constructor(id, type, name, date, duration, speed, difficulty, sessionId = null) {
    super(id, type, name, date, sessionId);
    // Parse numeric fields safely (handles string inputs)
    this.duration = safeParseNumeric(duration); // in minutes
    this.speed = safeParseNumeric(speed);       // in km/h
    this.difficulty = difficulty;              // e.g., 'Easy', 'Medium', 'Hard'
  }

  /**
   * Calculates effort score based on aerobic duration and speed.
   * @returns {number}
   */
  calculateEffortScore() {
    return this.duration * this.speed;
  }
}

/**
 * Power Session Class
 * Subclass extending BaseSession to store weightlifting-specific data.
 */
class PowerSession extends BaseSession {
  constructor(id, type, name, date, muscleGroup, reps, sets, weight, sessionId = null) {
    super(id, type, name, date, sessionId);
    this.muscleGroup = muscleGroup; // e.g., 'Chest', 'Legs', 'Back', 'Arms'
    // Parse numeric fields safely (handles string inputs)
    this.reps = safeParseNumeric(reps);
    this.sets = safeParseNumeric(sets);
    this.weight = safeParseNumeric(weight); // in kg
  }

  /**
   * Overrides calculateEffortScore() for Power training.
   * Effort = sets * reps * weight.
   * @returns {number}
   */
  calculateEffortScore() {
    return this.sets * this.reps * this.weight;
  }
}


/**
 * API ENDPOINTS
 */

/**
 * GET /api/users
 * Fetches all users from the DB file.
 */
app.get('/api/users', async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE_PATH);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to retrieve users database.' });
  }
});

/**
 * POST /api/users
 * Creates a new user profile and writes it to the users database.
 */
app.post('/api/users', async (req, res) => {
  try {
    const { name, tel } = req.body;
    if (!name || !tel) {
      return res.status(400).json({ error: 'Name and telephone are required.' });
    }

    const users = await readJsonFile(USERS_FILE_PATH);
    
    // Create new instance of User class (automatically increments static counter)
    const newUserInstance = new User(null, name, tel);
    
    // Convert class instance to object and append to database
    users.push({
      id: newUserInstance.id,
      name: newUserInstance.name,
      tel: newUserInstance.tel,
      sessions: newUserInstance.sessions
    });

    await writeJsonFile(USERS_FILE_PATH, users);
    res.status(201).json(newUserInstance);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

/**
 * GET /api/trainings
 * Fetches all available trainings from the catalog.
 */
app.get('/api/trainings', async (req, res) => {
  try {
    const trainings = await readJsonFile(TRAININGS_FILE_PATH);
    res.json(trainings);
  } catch (err) {
    console.error('Error fetching trainings:', err);
    res.status(500).json({ error: 'Failed to retrieve trainings catalog.' });
  }
});

/**
 * POST /api/trainings
 * Adds a new training item to the exercise catalog.
 */
app.post('/api/trainings', async (req, res) => {
  try {
    const { type, name } = req.body;
    if (!type || !name) {
      return res.status(400).json({ error: 'Training type (Power/Aerobic) and name are required.' });
    }
    if (type !== 'Power' && type !== 'Aerobic') {
      return res.status(400).json({ error: 'Type must be either Power or Aerobic.' });
    }

    const trainings = await readJsonFile(TRAININGS_FILE_PATH);
    
    // Instantiate new BaseTraining class to secure unique incremented id
    const newTraining = new BaseTraining(null, type, name);

    trainings.push({
      id: newTraining.id,
      type: newTraining.type,
      name: newTraining.name
    });

    await writeJsonFile(TRAININGS_FILE_PATH, trainings);
    res.status(201).json(newTraining);
  } catch (err) {
    console.error('Error adding training to catalog:', err);
    res.status(500).json({ error: 'Failed to add training to catalog.' });
  }
});

/**
 * POST /api/users/:userId/sessions
 * Instantiates and appends an extended session subclass to a user's session list.
 */
app.post('/api/users/:userId/sessions', async (req, res) => {
  try {
    const userId = safeParseNumeric(req.params.userId);
    const { trainingId, date, duration, speed, difficulty, muscleGroup, reps, sets, weight } = req.body;

    if (!trainingId || !date) {
      return res.status(400).json({ error: 'Training ID and date are required properties.' });
    }

    // Load DB lists
    const users = await readJsonFile(USERS_FILE_PATH);
    const trainings = await readJsonFile(TRAININGS_FILE_PATH);

    // Locate the user
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Locate the target training catalog item
    const catalogTraining = trainings.find(t => t.id === safeParseNumeric(trainingId));
    if (!catalogTraining) {
      return res.status(404).json({ error: 'Exercise type not found in catalog.' });
    }

    let instantiatedSession;

    // Instantiate correct subclass based on exercise type, using constructors
    if (catalogTraining.type === 'Aerobic') {
      instantiatedSession = new AerobicSession(
        catalogTraining.id,
        catalogTraining.type,
        catalogTraining.name,
        date,
        duration,
        speed,
        difficulty
      );
    } else if (catalogTraining.type === 'Power') {
      instantiatedSession = new PowerSession(
        catalogTraining.id,
        catalogTraining.type,
        catalogTraining.name,
        date,
        muscleGroup,
        reps,
        sets,
        weight
      );
    } else {
      return res.status(400).json({ error: 'Invalid training type in catalog.' });
    }

    // Since classes convert smoothly to JSON properties, push the instantiated object
    // to user's sessions array, including effort score calculations for convenience
    const sessionObj = {
      ...instantiatedSession,
      effortScore: instantiatedSession.calculateEffortScore()
    };

    users[userIndex].sessions.push(sessionObj);
    await writeJsonFile(USERS_FILE_PATH, users);

    res.status(201).json(sessionObj);
  } catch (err) {
    console.error('Error adding session:', err);
    res.status(500).json({ error: 'Failed to add workout session.' });
  }
});

/**
 * PUT /api/users/:userId/sessions/:sessionId
 * Modifies an existing workout session's details.
 */
app.put('/api/users/:userId/sessions/:sessionId', async (req, res) => {
  try {
    const userId = safeParseNumeric(req.params.userId);
    const { sessionId } = req.params;
    const updateData = req.body;

    const users = await readJsonFile(USERS_FILE_PATH);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const sessionIndex = users[userIndex].sessions.findIndex(s => s.sessionId === sessionId);
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Workout session not found.' });
    }

    const currentSession = users[userIndex].sessions[sessionIndex];
    let updatedInstance;

    // Maintain subclass characteristics during update, instantiating fresh class instances
    if (currentSession.type === 'Aerobic') {
      updatedInstance = new AerobicSession(
        currentSession.id,
        currentSession.type,
        currentSession.name,
        updateData.date || currentSession.date,
        updateData.duration !== undefined ? updateData.duration : currentSession.duration,
        updateData.speed !== undefined ? updateData.speed : currentSession.speed,
        updateData.difficulty || currentSession.difficulty,
        sessionId
      );
    } else if (currentSession.type === 'Power') {
      updatedInstance = new PowerSession(
        currentSession.id,
        currentSession.type,
        currentSession.name,
        updateData.date || currentSession.date,
        updateData.muscleGroup || currentSession.muscleGroup,
        updateData.reps !== undefined ? updateData.reps : currentSession.reps,
        updateData.sets !== undefined ? updateData.sets : currentSession.sets,
        updateData.weight !== undefined ? updateData.weight : currentSession.weight,
        sessionId
      );
    }

    const sessionObj = {
      ...updatedInstance,
      effortScore: updatedInstance.calculateEffortScore()
    };

    users[userIndex].sessions[sessionIndex] = sessionObj;
    await writeJsonFile(USERS_FILE_PATH, users);

    res.json(sessionObj);
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({ error: 'Failed to update workout session.' });
  }
});

/**
 * DELETE /api/users/:userId/sessions/:sessionId
 * Deletes a training session from the user profile.
 */
app.delete('/api/users/:userId/sessions/:sessionId', async (req, res) => {
  try {
    const userId = safeParseNumeric(req.params.userId);
    const { sessionId } = req.params;

    const users = await readJsonFile(USERS_FILE_PATH);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const sessions = users[userIndex].sessions;
    const sessionExists = sessions.some(s => s.sessionId === sessionId);
    if (!sessionExists) {
      return res.status(404).json({ error: 'Workout session not found.' });
    }

    // Filter out the session with the matching sessionId
    users[userIndex].sessions = sessions.filter(s => s.sessionId !== sessionId);
    await writeJsonFile(USERS_FILE_PATH, users);

    res.json({ message: 'Session deleted successfully.', sessionId });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ error: 'Failed to delete workout session.' });
  }
});

/**
 * SERVER STARTUP
 * Dynamically resolves id counters based on historical database entries to prevent collisions.
 */
async function startServer() {
  try {
    const users = await readJsonFile(USERS_FILE_PATH);
    if (users.length > 0) {
      // Find the highest user ID and add 1
      User.idCounter = Math.max(...users.map(u => safeParseNumeric(u.id))) + 1;
    }
    
    const trainings = await readJsonFile(TRAININGS_FILE_PATH);
    if (trainings.length > 0) {
      // Find the highest exercise ID and add 1
      BaseTraining.idCounter = Math.max(...trainings.map(t => safeParseNumeric(t.id))) + 1;
    }

    console.log(`Initialized User.idCounter to ${User.idCounter}`);
    console.log(`Initialized BaseTraining.idCounter to ${BaseTraining.idCounter}`);

    app.listen(PORT, () => {
      console.log(`Server is running successfully on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database counters or start server:', err);
    process.exit(1);
  }
}

startServer();
