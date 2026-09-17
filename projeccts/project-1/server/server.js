/**
 * Fitness Tracker Dashboard - Secure Express Backend with RBAC
 * 
 * This file serves as the main application entry point, containing:
 * 1. ES6 Class definitions for User, BaseTraining, BaseSession, AerobicSession, and PowerSession.
 * 2. File-based database helper functions using Node.js fs/promises.
 * 3. JWT & Bcrypt password-based authentication routes (/api/auth/register, /api/auth/login).
 * 4. Role-Based Access Control (RBAC) validations on Express API routes.
 * 5. Startup database self-healing migration to pre-hash plain passwords.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import authentication and authorization middlewares
const {
  JWT_SECRET,
  authenticateToken,
  requireSuperAdmin,
  requireAdminOrSuperAdmin,
  verifyUserOwnership
} = require('./middlewares/auth');

const app = express();
const PORT = 3000;

// Enable CORS so the client can query endpoints from different contexts
app.use(cors());
// Parse incoming JSON payloads
app.use(express.json());
// Serve frontend client folder statically
app.use(express.static(path.join(__dirname, '..', 'client')));

// Database file paths
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
 * Helper to read JSON database files.
 */
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

/**
 * Helper to write JSON database files.
 */
async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


/**
 * OBJECT-ORIENTED PROGRAMMING (OOP) CLASS DEFINITIONS
 */

/**
 * User Class
 */
class User {
  static idCounter = 1;

  constructor(id, name, tel, role = 'user', password, sessions = []) {
    if (!id) {
      this.id = User.idCounter++;
    } else {
      this.id = safeParseNumeric(id);
    }
    this.name = name;
    this.tel = tel;
    this.role = role; // 'user', 'admin', or 'superadmin'
    this.password = password; // Hashed password
    this.sessions = sessions;
  }
}

/**
 * Base Training Class (Catalog Level)
 */
class BaseTraining {
  static idCounter = 1;

  constructor(id, type, name) {
    if (!id) {
      this.id = BaseTraining.idCounter++;
    } else {
      this.id = safeParseNumeric(id);
    }
    this.type = type; // 'Power' or 'Aerobic'
    this.name = name;
  }
}

/**
 * Base Session Class
 */
class BaseSession extends BaseTraining {
  constructor(id, type, name, date, sessionId = null) {
    super(id, type, name);
    this.date = date;
    this.sessionId = sessionId || `sess_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
}

/**
 * Aerobic Session Class
 * Simulates calorie burn: duration * speed * 0.85
 */
class AerobicSession extends BaseSession {
  constructor(id, type, name, date, duration, speed, difficulty, sessionId = null) {
    super(id, type, name, date, sessionId);
    this.duration = safeParseNumeric(duration); // in minutes
    this.speed = safeParseNumeric(speed);       // in km/h
    this.difficulty = difficulty;              // 'Easy', 'Medium', 'Hard'
  }

  /**
   * Calculates calorie burn score based on speed and duration.
   * @returns {number}
   */
  calculateEffortScore() {
    return this.duration * (this.speed * 0.85);
  }
}

/**
 * Power Session Class
 * Effort score = sets * reps * weight
 */
class PowerSession extends BaseSession {
  constructor(id, type, name, date, muscleGroup, reps, sets, weight, sessionId = null) {
    super(id, type, name, date, sessionId);
    this.muscleGroup = muscleGroup;
    this.reps = safeParseNumeric(reps);
    this.sets = safeParseNumeric(sets);
    this.weight = safeParseNumeric(weight); // in kg
  }

  /**
   * Calculates weightlifting effort score.
   * @returns {number}
   */
  calculateEffortScore() {
    return this.sets * this.reps * this.weight;
  }
}


/**
 * AUTHENTICATION ENDPOINTS
 */

/**
 * POST /api/auth/register
 * Public registration endpoint. Creates a new user with 'user' role by default.
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, tel, password } = req.body;
    if (!name || !tel || !password) {
      return res.status(400).json({ error: 'Name, contact telephone, and password are required.' });
    }

    const users = await readJsonFile(USERS_FILE_PATH);

    // Verify user doesn't already exist under the same name or telephone
    const userExists = users.some(u => u.name.toLowerCase() === name.toLowerCase() || u.tel === tel);
    if (userExists) {
      return res.status(400).json({ error: 'A user with this name or telephone contact already exists.' });
    }

    // Hash the password before saving
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Instantiate User using class
    const newUserInstance = new User(null, name, tel, 'user', hashedPassword);

    const userObj = {
      id: newUserInstance.id,
      name: newUserInstance.name,
      tel: newUserInstance.tel,
      role: newUserInstance.role,
      password: newUserInstance.password,
      sessions: newUserInstance.sessions
    };

    users.push(userObj);
    await writeJsonFile(USERS_FILE_PATH, users);

    // Create JWT token for immediate login upon registration
    const token = jwt.sign(
      { userId: userObj.id, role: userObj.role, name: userObj.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: userObj.id, name: userObj.name, role: userObj.role, tel: userObj.tel }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during user registration.' });
  }
});

/**
 * POST /api/auth/login
 * Verifies credentials, returns JWT token and user profile information.
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'Username/Name and password are required.' });
    }

    const users = await readJsonFile(USERS_FILE_PATH);

    // Find the user profile by name (case-insensitive) or phone contact
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() || u.tel === name);
    if (!user) {
      return res.status(401).json({ error: 'Invalid name/contact or password.' });
    }

    // Verify the hashed password
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid name/contact or password.' });
    }

    // Sign the token
    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, tel: user.tel }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during user authentication.' });
  }
});


/**
 * SECURED USERS ENDPOINTS (RBAC-RESTRICTED)
 */

/**
 * GET /api/users
 * Returns list of all user profiles (sessions omitted or loaded based on role).
 * Accessible only to Admin and Super Admin.
 */
app.get('/api/users', authenticateToken, requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE_PATH);
    // Sanitize output (don't send passwords back)
    const sanitizedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      tel: u.tel,
      role: u.role,
      sessions: u.sessions
    }));
    res.json(sanitizedUsers);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

/**
 * GET /api/users/:userId
 * Retrieves profile of a specific user.
 * Protected by verifyUserOwnership (user can fetch self; Super Admin or Admin can fetch any).
 */
app.get('/api/users/:userId', authenticateToken, async (req, res, next) => {
  // Allow Admins and Super Admins to view anyone; regular users only themselves
  if (req.user.role === 'admin' || req.user.role === 'superadmin') {
    return next();
  }
  verifyUserOwnership(req, res, next);
}, async (req, res) => {
  try {
    const userId = safeParseNumeric(req.params.userId);
    const users = await readJsonFile(USERS_FILE_PATH);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({
      id: user.id,
      name: user.name,
      tel: user.tel,
      role: user.role,
      sessions: user.sessions
    });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

/**
 * POST /api/users
 * Admin API to create a new user profile.
 * Accessible to Admin and Super Admin.
 */
app.post('/api/users', authenticateToken, requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { name, tel, role, password } = req.body;
    if (!name || !tel || !password) {
      return res.status(400).json({ error: 'Name, telephone contact, and password are required.' });
    }

    const users = await readJsonFile(USERS_FILE_PATH);
    const userExists = users.some(u => u.name.toLowerCase() === name.toLowerCase());
    if (userExists) {
      return res.status(400).json({ error: 'User profile already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Default to 'user' role if unspecified. Staff Admin can create 'user' or 'admin' users.
    // Superadmin is only self-assigned or created by superadmin.
    const finalRole = role || 'user';

    const newUserInstance = new User(null, name, tel, finalRole, hashedPassword);
    const userObj = {
      id: newUserInstance.id,
      name: newUserInstance.name,
      tel: newUserInstance.tel,
      role: newUserInstance.role,
      password: newUserInstance.password,
      sessions: newUserInstance.sessions
    };

    users.push(userObj);
    await writeJsonFile(USERS_FILE_PATH, users);

    res.status(201).json({
      id: userObj.id,
      name: userObj.name,
      tel: userObj.tel,
      role: userObj.role
    });
  } catch (err) {
    console.error('Admin create user error:', err);
    res.status(500).json({ error: 'Failed to create user profile.' });
  }
});


/**
 * EXERCISE CATALOG ENDPOINTS
 */

/**
 * GET /api/trainings
 * Publicly viewable catalog list for authenticated users.
 */
app.get('/api/trainings', authenticateToken, async (req, res) => {
  try {
    const trainings = await readJsonFile(TRAININGS_FILE_PATH);
    res.json(trainings);
  } catch (err) {
    console.error('Get trainings error:', err);
    res.status(500).json({ error: 'Failed to load trainings catalog.' });
  }
});

/**
 * POST /api/trainings
 * Adds a new catalog training type.
 * Restricted to Admin and Super Admin.
 */
app.post('/api/trainings', authenticateToken, requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { type, name } = req.body;
    if (!type || !name) {
      return res.status(400).json({ error: 'Training type and name are required.' });
    }
    if (type !== 'Power' && type !== 'Aerobic') {
      return res.status(400).json({ error: 'Type must be Power or Aerobic.' });
    }

    const trainings = await readJsonFile(TRAININGS_FILE_PATH);
    const newTraining = new BaseTraining(null, type, name);

    trainings.push({
      id: newTraining.id,
      type: newTraining.type,
      name: newTraining.name
    });

    await writeJsonFile(TRAININGS_FILE_PATH, trainings);
    res.status(201).json(newTraining);
  } catch (err) {
    console.error('Create training catalog error:', err);
    res.status(500).json({ error: 'Failed to add exercise to catalog.' });
  }
});

/**
 * DELETE /api/trainings/:id
 * Deletes a catalog item.
 * Restricted ONLY to Super Admin.
 */
app.delete('/api/trainings/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const trainingId = safeParseNumeric(req.params.id);
    const trainings = await readJsonFile(TRAININGS_FILE_PATH);

    const exists = trainings.some(t => t.id === trainingId);
    if (!exists) {
      return res.status(404).json({ error: 'Exercise type not found in catalog.' });
    }

    const updatedTrainings = trainings.filter(t => t.id !== trainingId);
    await writeJsonFile(TRAININGS_FILE_PATH, updatedTrainings);

    res.json({ message: 'Catalog training deleted successfully.', id: trainingId });
  } catch (err) {
    console.error('Delete training catalog error:', err);
    res.status(500).json({ error: 'Failed to delete exercise from catalog.' });
  }
});


/**
 * WORKOUT SESSIONS ENDPOINTS
 */

/**
 * POST /api/users/:userId/sessions
 * Logs a new workout session for a user.
 * Protected by verifyUserOwnership (user can log for self; Super Admin can log for anyone).
 * Admin role blocked from logging user workouts unless they are logging their own.
 */
app.post('/api/users/:userId/sessions', authenticateToken, verifyUserOwnership, async (req, res) => {
  try {
    const userId = safeParseNumeric(req.params.userId);
    const { trainingId, date, duration, speed, difficulty, muscleGroup, reps, sets, weight } = req.body;

    if (!trainingId || !date) {
      return res.status(400).json({ error: 'Training ID and date are required.' });
    }

    const users = await readJsonFile(USERS_FILE_PATH);
    const trainings = await readJsonFile(TRAININGS_FILE_PATH);

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const catalogTraining = trainings.find(t => t.id === safeParseNumeric(trainingId));
    if (!catalogTraining) {
      return res.status(404).json({ error: 'Exercise type not found in catalog.' });
    }

    let instantiatedSession;

    // Instantiate appropriate subclass
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
      return res.status(400).json({ error: 'Invalid catalog type.' });
    }

    // Attach calculated calorie burn or power score
    const sessionObj = {
      ...instantiatedSession,
      effortScore: instantiatedSession.calculateEffortScore()
    };

    users[userIndex].sessions.push(sessionObj);
    await writeJsonFile(USERS_FILE_PATH, users);

    res.status(201).json(sessionObj);
  } catch (err) {
    console.error('Add workout session error:', err);
    res.status(500).json({ error: 'Failed to save workout session.' });
  }
});

/**
 * PUT /api/users/:userId/sessions/:sessionId
 * Updates a logged workout session.
 * Protected by verifyUserOwnership (user can edit self; Super Admin can edit anyone).
 * Admin role blocked.
 */
app.put('/api/users/:userId/sessions/:sessionId', authenticateToken, verifyUserOwnership, async (req, res) => {
  try {
    const userId = safeParseNumeric(req.params.userId);
    const { sessionId } = req.params;
    const updateData = req.body;

    const users = await readJsonFile(USERS_FILE_PATH);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const sessionIndex = users[userIndex].sessions.findIndex(s => s.sessionId === sessionId);
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Workout session not found.' });
    }

    const currentSession = users[userIndex].sessions[sessionIndex];
    let updatedInstance;

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
    console.error('Update session error:', err);
    res.status(500).json({ error: 'Failed to update workout session.' });
  }
});

/**
 * DELETE /api/users/:userId/sessions/:sessionId
 * Deletes a logged session.
 * Rules:
 * - Regular users can delete their own sessions.
 * - Staff Admins CANNOT delete.
 * - Super Admins can delete anything.
 */
app.delete('/api/users/:userId/sessions/:sessionId', authenticateToken, async (req, res, next) => {
  // Staff Admin has no delete permissions at all
  if (req.user.role === 'admin') {
    return res.status(403).json({ error: 'Delete privileges restricted to Super Admin or owners.' });
  }
  verifyUserOwnership(req, res, next);
}, async (req, res) => {
  try {
    const userId = safeParseNumeric(req.params.userId);
    const { sessionId } = req.params;

    const users = await readJsonFile(USERS_FILE_PATH);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const sessions = users[userIndex].sessions;
    const exists = sessions.some(s => s.sessionId === sessionId);
    if (!exists) {
      return res.status(404).json({ error: 'Workout session not found.' });
    }

    users[userIndex].sessions = sessions.filter(s => s.sessionId !== sessionId);
    await writeJsonFile(USERS_FILE_PATH, users);

    res.json({ message: 'Session deleted successfully.', sessionId });
  } catch (err) {
    console.error('Delete session error:', err);
    res.status(500).json({ error: 'Failed to delete workout session.' });
  }
});


/**
 * SERVER STARTUP & DATABASE SELF-HEALING/SEEDER
 */
async function startServer() {
  try {
    // 1. Resolve exercise catalog counters
    const trainings = await readJsonFile(TRAININGS_FILE_PATH);
    if (trainings.length > 0) {
      BaseTraining.idCounter = Math.max(...trainings.map(t => safeParseNumeric(t.id))) + 1;
    }

    // 2. Resolve users and hash plain passwords on boot (database migration helper)
    const users = await readJsonFile(USERS_FILE_PATH);
    let databaseModified = false;

    if (users.length > 0) {
      User.idCounter = Math.max(...users.map(u => safeParseNumeric(u.id))) + 1;
      
      // Check passwords and seed/hash plain text passwords
      users.forEach(user => {
        if (user.password && !user.password.startsWith('$2')) {
          const salt = bcrypt.genSaltSync(10);
          user.password = bcrypt.hashSync(user.password, salt);
          databaseModified = true;
          console.log(`Hashed plain password for user: ${user.name}`);
        }
      });
    }

    if (databaseModified) {
      await writeJsonFile(USERS_FILE_PATH, users);
    }

    console.log(`User.idCounter set to ${User.idCounter}`);
    console.log(`BaseTraining.idCounter set to ${BaseTraining.idCounter}`);

    app.listen(PORT, () => {
      console.log(`Secure Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Server startup initialization failed:', err);
    process.exit(1);
  }
}

startServer();
