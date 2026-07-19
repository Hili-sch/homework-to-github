/**
 * PulseFit Fitness Tracker - Client Logic
 * 
 * Contains:
 * 1. ES6 Class definitions replicating backend OOP models.
 * 2. Application state variables.
 * 3. Form validation, dynamic form fields, and modal triggers.
 * 4. API communication functions to query and persist changes on the Express server.
 * 5. Data filtering, sorting, stats calculation, and AI-like Insights generation using JS array methods.
 */

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * CLIENT-SIDE CLASS DEFINITIONS (OOP)
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
 * User Class
 */
class User {
  static idCounter = 1;
  constructor(id, name, tel, sessions = []) {
    this.id = id ? safeParseNumeric(id) : User.idCounter++;
    this.name = name;
    this.tel = tel;
    this.sessions = sessions.map(s => mapSession(s));
  }
}

/**
 * Base Training Class (Catalog level)
 */
class BaseTraining {
  static idCounter = 1;
  constructor(id, type, name) {
    this.id = id ? safeParseNumeric(id) : BaseTraining.idCounter++;
    this.type = type; // 'Power' or 'Aerobic'
    this.name = name;
  }
}

/**
 * Base Session Class (Workout Session level)
 */
class BaseSession extends BaseTraining {
  constructor(id, type, name, date, sessionId = null) {
    super(id, type, name);
    this.date = date;
    this.sessionId = sessionId || `sess_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
}

/**
 * Aerobic Session Subclass
 */
class AerobicSession extends BaseSession {
  constructor(id, type, name, date, duration, speed, difficulty, sessionId = null) {
    super(id, type, name, date, sessionId);
    this.duration = safeParseNumeric(duration);
    this.speed = safeParseNumeric(speed);
    this.difficulty = difficulty;
  }

  /**
   * Calculates aerobic effort score.
   * Effort = duration (mins) * speed (km/h)
   */
  calculateEffortScore() {
    return this.duration * this.speed;
  }
}

/**
 * Power Session Subclass
 */
class PowerSession extends BaseSession {
  constructor(id, type, name, date, muscleGroup, reps, sets, weight, sessionId = null) {
    super(id, type, name, date, sessionId);
    this.muscleGroup = muscleGroup;
    this.reps = safeParseNumeric(reps);
    this.sets = safeParseNumeric(sets);
    this.weight = safeParseNumeric(weight);
  }

  /**
   * Calculates weightlifting effort score.
   * Effort = sets * reps * weight (kg)
   */
  calculateEffortScore() {
    return this.sets * this.reps * this.weight;
  }
}

/**
 * Maps raw session JSON/objects into AerobicSession or PowerSession instances.
 */
function mapSession(s) {
  if (s.type === 'Aerobic') {
    return new AerobicSession(s.id, s.type, s.name, s.date, s.duration, s.speed, s.difficulty, s.sessionId);
  } else {
    return new PowerSession(s.id, s.type, s.name, s.date, s.muscleGroup, s.reps, s.sets, s.weight, s.sessionId);
  }
}


/**
 * APPLICATION STATE MANAGEMENT
 */
const AppState = {
  users: [],             // List of all User objects
  trainings: [],         // List of all BaseTraining catalog objects
  activeUser: null,      // User instance representing the selected user
  activeSessions: [],    // Array of session subclass instances for the active user
  sortField: 'date',     // 'date' or 'name' or 'effortScore'
  sortOrder: 'desc',     // 'asc' or 'desc'
  searchQuery: '',       // Search input filter
  filterType: 'All',     // 'All', 'Power', 'Aerobic'
  filterMuscle: 'All',   // 'All', 'Chest', 'Back', 'Legs', etc.
  editingSessionId: null // Session ID currently being edited
};


/**
 * DOM ELEMENT SELECTION
 */
const dom = {
  userSelect: document.getElementById('user-select'),
  btnShowAddUser: document.getElementById('btn-show-add-user'),
  addUserModal: document.getElementById('add-user-modal'),
  addUserForm: document.getElementById('add-user-form'),
  newUserName: document.getElementById('new-user-name'),
  newUserTel: document.getElementById('new-user-tel'),
  newUserNameError: document.getElementById('new-user-name-error'),
  newUserTelError: document.getElementById('new-user-tel-error'),
  btnCancelAddUser: document.getElementById('btn-cancel-add-user'),
  
  displayUserName: document.getElementById('display-user-name'),
  displayUserTel: document.getElementById('display-user-tel'),
  
  catalogList: document.getElementById('catalog-list'),
  addCatalogForm: document.getElementById('add-catalog-form'),
  catalogExerciseName: document.getElementById('catalog-exercise-name'),
  catalogExerciseType: document.getElementById('catalog-exercise-type'),
  catalogNameError: document.getElementById('catalog-name-error'),
  
  statTotalUsers: document.getElementById('stat-total-users'),
  statMaxWeight: document.getElementById('stat-max-weight'),
  statAvgAerobicTime: document.getElementById('stat-avg-aerobic-time'),
  statTotalPower: document.getElementById('stat-total-power'),
  
  workoutSessionForm: document.getElementById('workout-session-form'),
  sessionExerciseSelect: document.getElementById('session-exercise-select'),
  sessionDate: document.getElementById('session-date'),
  sessionExerciseError: document.getElementById('session-exercise-error'),
  sessionDateError: document.getElementById('session-date-error'),
  
  dynamicAerobicFields: document.getElementById('dynamic-aerobic-fields'),
  aerobicDuration: document.getElementById('aerobic-duration'),
  aerobicSpeed: document.getElementById('aerobic-speed'),
  aerobicDifficulty: document.getElementById('aerobic-difficulty'),
  aerobicDurationError: document.getElementById('aerobic-duration-error'),
  aerobicSpeedError: document.getElementById('aerobic-speed-error'),
  
  dynamicPowerFields: document.getElementById('dynamic-power-fields'),
  powerMuscleGroup: document.getElementById('power-muscle-group'),
  powerWeight: document.getElementById('power-weight'),
  powerSets: document.getElementById('power-sets'),
  powerReps: document.getElementById('power-reps'),
  powerMuscleGroupError: document.getElementById('power-muscle-group-error'),
  powerWeightError: document.getElementById('power-weight-error'),
  powerSetsError: document.getElementById('power-sets-error'),
  powerRepsError: document.getElementById('power-reps-error'),
  
  searchInput: document.getElementById('search-input'),
  filterType: document.getElementById('filter-type'),
  filterMuscle: document.getElementById('filter-muscle'),
  sortBy: document.getElementById('sort-by'),
  btnToggleSort: document.getElementById('btn-toggle-sort-order'),
  sessionsContainer: document.getElementById('sessions-container'),
  noSessionsPlaceholder: document.getElementById('no-sessions-placeholder'),
  
  insightsGrid: document.getElementById('insights-grid'),
  
  editSessionModal: document.getElementById('edit-session-modal'),
  editSessionForm: document.getElementById('edit-session-form'),
  editSessionName: document.getElementById('edit-session-name'),
  editSessionDate: document.getElementById('edit-session-date'),
  editSessionDateError: document.getElementById('edit-session-date-error'),
  editAerobicFields: document.getElementById('edit-aerobic-fields'),
  editAerobicDuration: document.getElementById('edit-aerobic-duration'),
  editAerobicSpeed: document.getElementById('edit-aerobic-speed'),
  editAerobicDifficulty: document.getElementById('edit-aerobic-difficulty'),
  editAerobicDurationError: document.getElementById('edit-aerobic-duration-error'),
  editAerobicSpeedError: document.getElementById('edit-aerobic-speed-error'),
  editPowerFields: document.getElementById('edit-power-fields'),
  editPowerMuscleGroup: document.getElementById('edit-power-muscle-group'),
  editPowerWeight: document.getElementById('edit-power-weight'),
  editPowerSets: document.getElementById('edit-power-sets'),
  editPowerReps: document.getElementById('edit-power-reps'),
  editPowerWeightError: document.getElementById('edit-power-weight-error'),
  editPowerSetsError: document.getElementById('edit-power-sets-error'),
  editPowerRepsError: document.getElementById('edit-power-reps-error'),
  btnCancelEditSession: document.getElementById('btn-cancel-edit-session')
};


/**
 * API SERVICE / BACKEND NETWORK CALLS
 */

/**
 * Fetch all users from server
 */
async function apiGetUsers() {
  const res = await fetch(`${API_BASE_URL}/users`);
  if (!res.ok) throw new Error('Failed to load users');
  return await res.json();
}

/**
 * Create a new user profile on server
 */
async function apiCreateUser(name, tel) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, tel })
  });
  if (!res.ok) throw new Error('Failed to create user');
  return await res.json();
}

/**
 * Fetch trainings catalog from server
 */
async function apiGetTrainings() {
  const res = await fetch(`${API_BASE_URL}/trainings`);
  if (!res.ok) throw new Error('Failed to load trainings');
  return await res.json();
}

/**
 * Add a training item to the catalog
 */
async function apiCreateTraining(type, name) {
  const res = await fetch(`${API_BASE_URL}/trainings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, name })
  });
  if (!res.ok) throw new Error('Failed to add exercise to catalog');
  return await res.json();
}

/**
 * Log a new workout session for a user
 */
async function apiCreateSession(userId, sessionData) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData)
  });
  if (!res.ok) throw new Error('Failed to save workout session');
  return await res.json();
}

/**
 * Update an existing session
 */
async function apiUpdateSession(userId, sessionId, updateData) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/sessions/${sessionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) throw new Error('Failed to update workout session');
  return await res.json();
}

/**
 * Delete a session
 */
async function apiDeleteSession(userId, sessionId) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/sessions/${sessionId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete workout session');
  return await res.json();
}


/**
 * INITIALIZATION & USER SWITCHING LOGIC
 */

/**
 * Initialize application state by loading users and catalog
 */
async function initializeApp() {
  try {
    // 1. Fetch data from backend
    AppState.users = await apiGetUsers();
    AppState.trainings = await apiGetTrainings();

    // 2. Render User selection options
    renderUserSelectDropdown();
    
    // 3. Pre-select first user if available
    if (AppState.users.length > 0) {
      AppState.selectedUserId = AppState.users[0].id;
      dom.userSelect.value = AppState.selectedUserId;
      selectActiveUser(AppState.selectedUserId);
    }

    // 4. Render initial lists and stats
    renderTrainingsCatalog();
    populateExerciseSelectDropdown();
    updateGlobalStats();
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

/**
 * Populate user dropdown switcher
 */
function renderUserSelectDropdown() {
  const currentValue = dom.userSelect.value;
  dom.userSelect.innerHTML = '<option value="" disabled>Select User...</option>';
  
  AppState.users.forEach(user => {
    const opt = document.createElement('option');
    opt.value = user.id;
    opt.textContent = `${user.name} (${user.tel})`;
    dom.userSelect.appendChild(opt);
  });

  if (currentValue && AppState.users.some(u => u.id === Number(currentValue))) {
    dom.userSelect.value = currentValue;
  }
}

/**
 * Switch active user context and load their activities
 */
function selectActiveUser(userId) {
  const userObj = AppState.users.find(u => u.id === Number(userId));
  if (!userObj) return;

  // Instantiate OOP class User
  AppState.activeUser = new User(userObj.id, userObj.name, userObj.tel, userObj.sessions);
  AppState.activeSessions = AppState.activeUser.sessions;

  // Update UI Elements
  dom.displayUserName.textContent = AppState.activeUser.name;
  dom.displayUserTel.textContent = AppState.activeUser.tel;

  // Clear inputs and error warnings
  clearFormErrors(dom.workoutSessionForm);
  dom.workoutSessionForm.reset();
  dom.dynamicAerobicFields.classList.add('hidden');
  dom.dynamicPowerFields.classList.add('hidden');

  // Trigger filters, stats, and insights updates
  processAndRenderSessions();
  updateGlobalStats();
}

/**
 * Updates summary stats card data
 */
function updateGlobalStats() {
  dom.statTotalUsers.textContent = AppState.users.length;

  if (!AppState.activeUser) {
    dom.statMaxWeight.innerHTML = `0 <span class="unit">kg</span>`;
    dom.statAvgAerobicTime.innerHTML = `0 <span class="unit">min</span>`;
    dom.statTotalPower.textContent = 0;
    return;
  }

  // Calculate statistics using array methods: filter, map, reduce
  const sessions = AppState.activeSessions;
  
  // Power Sessions Stats
  const powerSessions = sessions.filter(s => s.type === 'Power');
  dom.statTotalPower.textContent = powerSessions.length;

  // Max Weight Lifted
  if (powerSessions.length > 0) {
    const weights = powerSessions.map(s => s.weight);
    const maxWeight = Math.max(...weights);
    dom.statMaxWeight.innerHTML = `${maxWeight} <span class="unit">kg</span>`;
  } else {
    dom.statMaxWeight.innerHTML = `0 <span class="unit">kg</span>`;
  }

  // Avg Aerobic Time
  const aerobicSessions = sessions.filter(s => s.type === 'Aerobic');
  if (aerobicSessions.length > 0) {
    const totalDuration = aerobicSessions.reduce((acc, curr) => acc + curr.duration, 0);
    const avgDuration = Math.round(totalDuration / aerobicSessions.length);
    dom.statAvgAerobicTime.innerHTML = `${avgDuration} <span class="unit">min</span>`;
  } else {
    dom.statAvgAerobicTime.innerHTML = `0 <span class="unit">min</span>`;
  }
}

/**
 * Generate 4 human-readable insights for the active user
 */
function renderInsights() {
  dom.insightsGrid.innerHTML = '';
  
  if (!AppState.activeUser || AppState.activeSessions.length === 0) {
    dom.insightsGrid.innerHTML = `
      <div class="insight-item" style="grid-column: span 2; justify-content: center;">
        <p class="insight-text" style="color: var(--text-muted);">Not enough training data available to calculate insights.</p>
      </div>
    `;
    return;
  }

  const sessions = AppState.activeSessions;
  const totalCount = sessions.length;
  const powerSessions = sessions.filter(s => s.type === 'Power');
  const aerobicSessions = sessions.filter(s => s.type === 'Aerobic');

  const insights = [];

  // Insight 1: Distribution Ratio
  const powerPercentage = Math.round((powerSessions.length / totalCount) * 100);
  const aerobicPercentage = 100 - powerPercentage;
  insights.push({
    icon: '📊',
    text: `Your training focus is ${powerPercentage}% Power workouts and ${aerobicPercentage}% Aerobic routines.`
  });

  // Insight 2: Max Effort Workout (Power vs Aerobic comparison)
  const maxEffortSession = [...sessions].sort((a, b) => b.calculateEffortScore() - a.calculateEffortScore())[0];
  if (maxEffortSession) {
    const score = Math.round(maxEffortSession.calculateEffortScore());
    insights.push({
      icon: '🏆',
      text: `Your single highest effort workout was "${maxEffortSession.name}" on ${maxEffortSession.date} with a performance score of ${score}.`
    });
  }

  // Insight 3: Power insights (most targeted muscle group)
  if (powerSessions.length > 0) {
    const muscleCounts = powerSessions.reduce((acc, curr) => {
      acc[curr.muscleGroup] = (acc[curr.muscleGroup] || 0) + 1;
      return acc;
    }, {});
    
    let favoriteMuscle = '';
    let maxCount = 0;
    for (const [muscle, count] of Object.entries(muscleCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteMuscle = muscle;
      }
    }
    
    insights.push({
      icon: '🏋️',
      text: `You target the "${favoriteMuscle}" muscle group most frequently, accounting for ${maxCount} power sessions.`
    });
  } else {
    insights.push({
      icon: '🏋️',
      text: 'Log your first Power lifting session to analyze target muscle group trends.'
    });
  }

  // Insight 4: Aerobic insights (consistency and speed progress)
  if (aerobicSessions.length > 0) {
    const avgSpeed = (aerobicSessions.reduce((acc, curr) => acc + curr.speed, 0) / aerobicSessions.length).toFixed(1);
    const hasHardWorkouts = aerobicSessions.some(s => s.difficulty === 'Hard');
    
    let aerobicInsightText = `Your average aerobic pace is ${avgSpeed} km/h. `;
    if (hasHardWorkouts) {
      aerobicInsightText += "You've successfully conquered 'Hard' difficulty cardio challenges!";
    } else {
      aerobicInsightText += "Challenge yourself by dialing up difficulty to 'Hard' in future sessions.";
    }

    insights.push({
      icon: '🏃',
      text: aerobicInsightText
    });
  } else {
    insights.push({
      icon: '🏃',
      text: 'Cardiovascular activity is key! Try adding an aerobic workout like Running or Cycling to your regime.'
    });
  }

  // Make sure at least 4 items are displayed
  insights.slice(0, 4).forEach(ins => {
    const div = document.createElement('div');
    div.className = 'insight-item';
    div.innerHTML = `
      <span class="insight-icon">${ins.icon}</span>
      <p class="insight-text">${ins.text}</p>
    `;
    dom.insightsGrid.appendChild(div);
  });
}


/**
 * FILTERING, SORTING AND RENDERING
 */

/**
 * Handle search, filter, and sort criteria, and rebuild cards in DOM
 */
function processAndRenderSessions() {
  let filtered = [...AppState.activeSessions];

  // 1. Filter by search query (case-insensitive)
  if (AppState.searchQuery.trim() !== '') {
    const query = AppState.searchQuery.toLowerCase();
    filtered = filtered.filter(s => s.name.toLowerCase().includes(query));
  }

  // 2. Filter by Workout Type (Power / Aerobic)
  if (AppState.filterType !== 'All') {
    filtered = filtered.filter(s => s.type === AppState.filterType);
  }

  // 3. Filter by Muscle Group (Power sessions only)
  if (AppState.filterMuscle !== 'All') {
    filtered = filtered.filter(s => s.type === 'Power' && s.muscleGroup === AppState.filterMuscle);
  }

  // 4. Sort workouts
  filtered.sort((a, b) => {
    let comparison = 0;
    
    if (AppState.sortField === 'date') {
      comparison = new Date(a.date) - new Date(b.date);
    } else if (AppState.sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (AppState.sortField === 'effortScore') {
      comparison = a.calculateEffortScore() - b.calculateEffortScore();
    }

    return AppState.sortOrder === 'asc' ? comparison : -comparison;
  });

  // Render cards
  renderSessionCards(filtered);
  renderInsights();
}

/**
 * Generates workout session cards and injects them in DOM
 */
function renderSessionCards(sessions) {
  dom.sessionsContainer.innerHTML = '';

  if (sessions.length === 0) {
    dom.noSessionsPlaceholder.classList.remove('hidden');
    dom.sessionsContainer.appendChild(dom.noSessionsPlaceholder);
    return;
  }

  dom.noSessionsPlaceholder.classList.add('hidden');

  sessions.forEach(session => {
    const effort = Math.round(session.calculateEffortScore());
    const card = document.createElement('article');
    card.className = `workout-card glass-card ${session.type.toLowerCase()}`;
    card.setAttribute('data-session-id', session.sessionId);

    // Build specific details structure
    let detailsHtml = '';
    if (session.type === 'Aerobic') {
      detailsHtml = `
        <div class="detail-item">
          <span class="detail-label">Duration</span>
          <span class="detail-value">${session.duration} min</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Speed</span>
          <span class="detail-value">${session.speed} km/h</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Difficulty</span>
          <span class="detail-value">${session.difficulty}</span>
        </div>
      `;
    } else if (session.type === 'Power') {
      detailsHtml = `
        <div class="detail-item">
          <span class="detail-label">Muscle</span>
          <span class="detail-value">${session.muscleGroup}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Weight</span>
          <span class="detail-value">${session.weight} kg</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Sets × Reps</span>
          <span class="detail-value">${session.sets} × ${session.reps}</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="card-header-row">
        <div class="card-title-group">
          <h3 class="card-exercise-name">${session.name}</h3>
          <span class="card-date">🗓️ ${session.date}</span>
        </div>
        <div class="card-effort-badge">
          <span class="effort-val">${effort}</span>
          <span class="effort-lbl">Effort score</span>
        </div>
      </div>

      <div class="card-details-grid">
        ${detailsHtml}
      </div>

      <div class="card-actions-row">
        <button type="button" class="btn btn-secondary btn-icon-only btn-edit" onclick="handleEditSessionClick('${session.sessionId}')">
          Edit
        </button>
        <button type="button" class="btn btn-danger btn-icon-only" onclick="handleDeleteSessionClick('${session.sessionId}')">
          Delete
        </button>
      </div>
    `;

    dom.sessionsContainer.appendChild(card);
  });
}

/**
 * Render catalog list inside sidebar
 */
function renderTrainingsCatalog() {
  dom.catalogList.innerHTML = '';
  
  AppState.trainings.forEach(item => {
    const li = document.createElement('li');
    li.className = 'catalog-item';
    li.innerHTML = `
      <span class="catalog-item-name">${item.name}</span>
      <span class="badge-type ${item.type.toLowerCase()}">${item.type}</span>
    `;
    dom.catalogList.appendChild(li);
  });
}

/**
 * Populate Exercise Selection dropdown inside logging form
 */
function populateExerciseSelectDropdown() {
  const currentValue = dom.sessionExerciseSelect.value;
  dom.sessionExerciseSelect.innerHTML = '<option value="" disabled selected>Choose from catalog...</option>';
  
  AppState.trainings.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `${item.name} (${item.type})`;
    dom.sessionExerciseSelect.appendChild(opt);
  });

  if (currentValue && AppState.trainings.some(t => t.id === Number(currentValue))) {
    dom.sessionExerciseSelect.value = currentValue;
  }
}


/**
 * FORM VALIDATION AND UTILITIES
 */

/**
 * Display specific text validation error beneath an input
 */
function showInputError(element, message) {
  if (element) {
    element.textContent = message;
  }
}

/**
 * Clear all warning messages in a form
 */
function clearFormErrors(formElement) {
  const errors = formElement.querySelectorAll('.error-msg');
  errors.forEach(e => e.textContent = '');
}


/**
 * EVENT HANDLERS & BINDINGS
 */

// User Selection switch
dom.userSelect.addEventListener('change', (e) => {
  selectActiveUser(e.target.value);
});

// Trigger User Modal show
dom.btnShowAddUser.addEventListener('click', () => {
  clearFormErrors(dom.addUserForm);
  dom.addUserForm.reset();
  dom.addUserModal.classList.remove('hidden');
});

// Cancel User Modal
dom.btnCancelAddUser.addEventListener('click', () => {
  dom.addUserModal.classList.add('hidden');
});

// Handle User submit creation
dom.addUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(dom.addUserForm);
  
  const name = dom.newUserName.value.trim();
  const tel = dom.newUserTel.value.trim();
  
  let valid = true;
  if (!name) {
    showInputError(dom.newUserNameError, 'Name is required.');
    valid = false;
  }
  if (!tel) {
    showInputError(dom.newUserTelError, 'Contact is required.');
    valid = false;
  } else if (!/^[0-9\-+ ]{7,15}$/.test(tel)) {
    showInputError(dom.newUserTelError, 'Provide a valid phone format.');
    valid = false;
  }

  if (!valid) return;

  try {
    const newUserObj = await apiCreateUser(name, tel);
    AppState.users.push(newUserObj);
    
    // Refresh dropdown selection list
    renderUserSelectDropdown();
    
    // Switch to the newly created user
    AppState.selectedUserId = newUserObj.id;
    dom.userSelect.value = AppState.selectedUserId;
    selectActiveUser(AppState.selectedUserId);
    
    // Close modal
    dom.addUserModal.classList.add('hidden');
  } catch (err) {
    console.error(err);
  }
});

// Handle exercise catalog submit adding
dom.addCatalogForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(dom.addCatalogForm);

  const name = dom.catalogExerciseName.value.trim();
  const type = dom.catalogExerciseType.value;

  if (!name) {
    showInputError(dom.catalogNameError, 'Name is required.');
    return;
  }

  try {
    const newItem = await apiCreateTraining(type, name);
    AppState.trainings.push(newItem);
    
    // Refresh catalogs display in DOM
    renderTrainingsCatalog();
    populateExerciseSelectDropdown();
    
    dom.addCatalogForm.reset();
  } catch (err) {
    console.error(err);
  }
});

// Trigger forms display dynamically when selecting catalog exercises
dom.sessionExerciseSelect.addEventListener('change', (e) => {
  const val = e.target.value;
  const training = AppState.trainings.find(t => t.id === Number(val));
  if (!training) return;

  if (training.type === 'Aerobic') {
    dom.dynamicAerobicFields.classList.remove('hidden');
    dom.dynamicPowerFields.classList.add('hidden');
  } else if (training.type === 'Power') {
    dom.dynamicPowerFields.classList.remove('hidden');
    dom.dynamicAerobicFields.classList.add('hidden');
  }
});

// Log workout session submit handler
dom.workoutSessionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(dom.workoutSessionForm);

  if (!AppState.activeUser) {
    showInputError(dom.sessionExerciseError, 'Please select an active user first.');
    return;
  }

  const trainingId = dom.sessionExerciseSelect.value;
  const date = dom.sessionDate.value;

  let valid = true;

  if (!trainingId) {
    showInputError(dom.sessionExerciseError, 'Choose an exercise.');
    valid = false;
  }
  if (!date) {
    showInputError(dom.sessionDateError, 'Select a date.');
    valid = false;
  }

  const training = AppState.trainings.find(t => t.id === Number(trainingId));
  const payload = { trainingId, date };

  if (training) {
    if (training.type === 'Aerobic') {
      const dur = dom.aerobicDuration.value;
      const spd = dom.aerobicSpeed.value;
      const diff = dom.aerobicDifficulty.value;

      if (!dur || Number(dur) <= 0) {
        showInputError(dom.aerobicDurationError, 'Positive duration is required.');
        valid = false;
      }
      if (!spd || Number(spd) <= 0) {
        showInputError(dom.aerobicSpeedError, 'Positive speed is required.');
        valid = false;
      }

      payload.duration = dur;
      payload.speed = spd;
      payload.difficulty = diff;
    } else if (training.type === 'Power') {
      const mg = dom.powerMuscleGroup.value;
      const w = dom.powerWeight.value;
      const s = dom.powerSets.value;
      const r = dom.powerReps.value;

      if (!w || Number(w) < 0) {
        showInputError(dom.powerWeightError, 'Provide weight (>= 0).');
        valid = false;
      }
      if (!s || Number(s) <= 0) {
        showInputError(dom.powerSetsError, 'Positive sets required.');
        valid = false;
      }
      if (!r || Number(r) <= 0) {
        showInputError(dom.powerRepsError, 'Positive reps required.');
        valid = false;
      }

      payload.muscleGroup = mg;
      payload.weight = w;
      payload.sets = s;
      payload.reps = r;
    }
  }

  if (!valid) return;

  try {
    const savedSessionObj = await apiCreateSession(AppState.activeUser.id, payload);
    
    // Add instance of Session subclasses to AppState active sessions
    const instantiatedSession = mapSession(savedSessionObj);
    AppState.activeSessions.push(instantiatedSession);
    
    // Update local copy of users array
    const usrIdx = AppState.users.findIndex(u => u.id === AppState.activeUser.id);
    if (usrIdx !== -1) {
      AppState.users[usrIdx].sessions.push(savedSessionObj);
    }

    // Refresh display view
    processAndRenderSessions();
    updateGlobalStats();

    // Reset Form
    dom.workoutSessionForm.reset();
    dom.dynamicAerobicFields.classList.add('hidden');
    dom.dynamicPowerFields.classList.add('hidden');
  } catch (err) {
    console.error(err);
  }
});

// Filters search, type, and muscle change handlers
dom.searchInput.addEventListener('input', (e) => {
  AppState.searchQuery = e.target.value;
  processAndRenderSessions();
});

dom.filterType.addEventListener('change', (e) => {
  AppState.filterType = e.target.value;
  
  // Hide muscle selector if filter is Aerobic only
  if (AppState.filterType === 'Aerobic') {
    dom.filterMuscle.disabled = true;
    dom.filterMuscle.value = 'All';
    AppState.filterMuscle = 'All';
  } else {
    dom.filterMuscle.disabled = false;
  }
  processAndRenderSessions();
});

dom.filterMuscle.addEventListener('change', (e) => {
  AppState.filterMuscle = e.target.value;
  processAndRenderSessions();
});

dom.sortBy.addEventListener('change', (e) => {
  AppState.sortField = e.target.value;
  processAndRenderSessions();
});

dom.btnToggleSort.addEventListener('click', () => {
  const current = dom.btnToggleSort.getAttribute('data-order');
  if (current === 'desc') {
    dom.btnToggleSort.setAttribute('data-order', 'asc');
    dom.btnToggleSort.textContent = 'Asc ↑';
    AppState.sortOrder = 'asc';
  } else {
    dom.btnToggleSort.setAttribute('data-order', 'desc');
    dom.btnToggleSort.textContent = 'Desc ↓';
    AppState.sortOrder = 'desc';
  }
  processAndRenderSessions();
});


/**
 * EDIT & DELETE MODAL HANDLERS
 */

/**
 * Triggered by Edit button inside a card
 */
window.handleEditSessionClick = function(sessionId) {
  const session = AppState.activeSessions.find(s => s.sessionId === sessionId);
  if (!session) return;

  AppState.editingSessionId = sessionId;
  clearFormErrors(dom.editSessionForm);

  // Populate common values
  dom.editSessionName.value = session.name;
  dom.editSessionDate.value = session.date;

  // Reveal fields matching category
  if (session.type === 'Aerobic') {
    dom.editAerobicFields.classList.remove('hidden');
    dom.editPowerFields.classList.add('hidden');
    
    dom.editAerobicDuration.value = session.duration;
    dom.editAerobicSpeed.value = session.speed;
    dom.editAerobicDifficulty.value = session.difficulty;
  } else if (session.type === 'Power') {
    dom.editPowerFields.classList.remove('hidden');
    dom.editAerobicFields.classList.add('hidden');

    dom.editPowerMuscleGroup.value = session.muscleGroup;
    dom.editPowerWeight.value = session.weight;
    dom.editPowerSets.value = session.sets;
    dom.editPowerReps.value = session.reps;
  }

  dom.editSessionModal.classList.remove('hidden');
};

// Cancel editing
dom.btnCancelEditSession.addEventListener('click', () => {
  dom.editSessionModal.classList.add('hidden');
  AppState.editingSessionId = null;
});

// Edit Submit Save
dom.editSessionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(dom.editSessionForm);

  if (!AppState.activeUser || !AppState.editingSessionId) return;

  const date = dom.editSessionDate.value;
  let valid = true;

  if (!date) {
    showInputError(dom.editSessionDateError, 'Date is required.');
    valid = false;
  }

  const session = AppState.activeSessions.find(s => s.sessionId === AppState.editingSessionId);
  const payload = { date };

  if (session) {
    if (session.type === 'Aerobic') {
      const dur = dom.editAerobicDuration.value;
      const spd = dom.editAerobicSpeed.value;
      const diff = dom.editAerobicDifficulty.value;

      if (!dur || Number(dur) <= 0) {
        showInputError(dom.editAerobicDurationError, 'Positive duration required.');
        valid = false;
      }
      if (!spd || Number(spd) <= 0) {
        showInputError(dom.editAerobicSpeedError, 'Positive speed required.');
        valid = false;
      }

      payload.duration = dur;
      payload.speed = spd;
      payload.difficulty = diff;
    } else if (session.type === 'Power') {
      const mg = dom.editPowerMuscleGroup.value;
      const w = dom.editPowerWeight.value;
      const s = dom.editPowerSets.value;
      const r = dom.editPowerReps.value;

      if (!w || Number(w) < 0) {
        showInputError(dom.editPowerWeightError, 'Provide weight (>= 0).');
        valid = false;
      }
      if (!s || Number(s) <= 0) {
        showInputError(dom.editPowerSetsError, 'Positive sets required.');
        valid = false;
      }
      if (!r || Number(r) <= 0) {
        showInputError(dom.editPowerRepsError, 'Positive reps required.');
        valid = false;
      }

      payload.muscleGroup = mg;
      payload.weight = w;
      payload.sets = s;
      payload.reps = r;
    }
  }

  if (!valid) return;

  try {
    const updatedRawSession = await apiUpdateSession(AppState.activeUser.id, AppState.editingSessionId, payload);
    const updatedInstance = mapSession(updatedRawSession);

    // Update in AppState active sessions list
    const sessionIdx = AppState.activeSessions.findIndex(s => s.sessionId === AppState.editingSessionId);
    if (sessionIdx !== -1) {
      AppState.activeSessions[sessionIdx] = updatedInstance;
    }

    // Update inside users array
    const userIdx = AppState.users.findIndex(u => u.id === AppState.activeUser.id);
    if (userIdx !== -1) {
      const dbSessIdx = AppState.users[userIdx].sessions.findIndex(s => s.sessionId === AppState.editingSessionId);
      if (dbSessIdx !== -1) {
        AppState.users[userIdx].sessions[dbSessIdx] = updatedRawSession;
      }
    }

    // Refresh
    processAndRenderSessions();
    updateGlobalStats();

    // Close Modal
    dom.editSessionModal.classList.add('hidden');
    AppState.editingSessionId = null;
  } catch (err) {
    console.error(err);
  }
});

/**
 * Triggered by Delete button inside a card
 */
window.handleDeleteSessionClick = async function(sessionId) {
  if (!AppState.activeUser) return;
  
  const confirmDelete = confirm('Are you sure you want to delete this workout session?');
  if (!confirmDelete) return;

  try {
    await apiDeleteSession(AppState.activeUser.id, sessionId);

    // Filter out from active sessions
    AppState.activeSessions = AppState.activeSessions.filter(s => s.sessionId !== sessionId);
    
    // Update local user sessions array
    const userIdx = AppState.users.findIndex(u => u.id === AppState.activeUser.id);
    if (userIdx !== -1) {
      AppState.users[userIdx].sessions = AppState.users[userIdx].sessions.filter(s => s.sessionId !== sessionId);
    }

    // Refresh view
    processAndRenderSessions();
    updateGlobalStats();
  } catch (err) {
    console.error(err);
  }
};


// Run initialization on page load
window.addEventListener('DOMContentLoaded', initializeApp);
