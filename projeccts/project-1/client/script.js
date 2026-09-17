/**
 * PulseFit Fitness Tracker - Secure Client Logic
 * 
 * Contains:
 * 1. ES6 class definitions (polymorphic calorie burn effort scoring).
 * 2. Token-based state management (runtime token storage).
 * 3. Role-Based Access Control (RBAC) UI adaptation logic.
 * 4. Forms triggers, inline validations, and HTTP authorization headers.
 * 5. Data operations (combined filtering, sorting, statistics, insights).
 * 6. Element visibility guards using CSS display none rules.
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
  constructor(id, name, tel, role = 'user', sessions = []) {
    this.id = id ? safeParseNumeric(id) : User.idCounter++;
    this.name = name;
    this.tel = tel;
    this.role = role;
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
 * Simulates calorie burn: duration * speed * 0.85
 */
class AerobicSession extends BaseSession {
  constructor(id, type, name, date, duration, speed, difficulty, sessionId = null) {
    super(id, type, name, date, sessionId);
    this.duration = safeParseNumeric(duration);
    this.speed = safeParseNumeric(speed);
    this.difficulty = difficulty;
  }

  /**
   * Calculates aerobic calorie burn.
   * Calorie Burn = duration (mins) * (speed (km/h) * 0.85)
   */
  calculateEffortScore() {
    return this.duration * (this.speed * 0.85);
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
  token: null,           // JWT Security Token (Held in runtime memory)
  userRole: null,        // 'user', 'admin', or 'superadmin'
  userId: null,          // Logged-in user's database ID
  users: [],             // All loaded user profiles (for admins)
  trainings: [],         // Trainings catalog list
  activeUser: null,      // User instance representing the viewed profile
  activeSessions: [],    // Workouts of the active viewed user
  sortField: 'date',     // 'date', 'name', 'effortScore'
  sortOrder: 'desc',     // 'asc', 'desc'
  searchQuery: '',       // Filtering query
  filterType: 'All',     // Type filter
  filterMuscle: 'All',   // Muscle group filter
  editingSessionId: null // Target session ID for edit
};


/**
 * DOM ELEMENT SELECTION
 */
const dom = {
  authOverlay: document.getElementById('auth-overlay'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  authSubtitle: document.getElementById('auth-subtitle-text'),
  linkShowRegister: document.getElementById('link-show-register'),
  linkShowLogin: document.getElementById('link-show-login'),
  
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  loginUsernameError: document.getElementById('login-username-error'),
  loginPasswordError: document.getElementById('login-password-error'),
  
  registerName: document.getElementById('register-name'),
  registerTel: document.getElementById('register-tel'),
  registerPassword: document.getElementById('register-password'),
  registerNameError: document.getElementById('register-name-error'),
  registerTelError: document.getElementById('register-tel-error'),
  registerPasswordError: document.getElementById('register-password-error'),
  
  appContainer: document.getElementById('app-container'),
  btnLogout: document.getElementById('btn-logout'),
  userSelectContainer: document.getElementById('user-select-container'),
  userSelect: document.getElementById('user-select'),
  btnShowAddUser: document.getElementById('btn-show-add-user'),
  
  addUserModal: document.getElementById('add-user-modal'),
  addUserForm: document.getElementById('add-user-form'),
  newUserName: document.getElementById('new-user-name'),
  newUserTel: document.getElementById('new-user-tel'),
  newUserPassword: document.getElementById('new-user-password'),
  newUserRole: document.getElementById('new-user-role'),
  newUserNameError: document.getElementById('new-user-name-error'),
  newUserTelError: document.getElementById('new-user-tel-error'),
  newUserPasswordError: document.getElementById('new-user-password-error'),
  btnCancelAddUser: document.getElementById('btn-cancel-add-user'),
  
  displayUserName: document.getElementById('display-user-name'),
  displayUserTel: document.getElementById('display-user-tel'),
  displayUserRole: document.getElementById('display-user-role'),
  
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
 * API SERVICE / BACKEND NETWORK CALLS WITH JWT HEADERS
 */

/**
 * Build request options containing Authorization headers if token is present
 */
function getRequestOptions(method, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (AppState.token) {
    headers['Authorization'] = `Bearer ${AppState.token}`;
  }
  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
}

/**
 * Handle authentication login
 */
async function apiLogin(name, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Login failed');
  }
  return await res.json();
}

/**
 * Handle public user registration
 */
async function apiRegister(name, tel, password) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, tel, password })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Registration failed');
  }
  return await res.json();
}

/**
 * Fetch all users (Admins only)
 */
async function apiGetUsers() {
  const res = await fetch(`${API_BASE_URL}/users`, getRequestOptions('GET'));
  if (!res.ok) throw new Error('Unauthorized to fetch users list.');
  return await res.json();
}

/**
 * Fetch specific user profile (sessions included)
 */
async function apiGetUserProfile(userId) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`, getRequestOptions('GET'));
  if (!res.ok) throw new Error('Unauthorized to fetch this user profile.');
  return await res.json();
}

/**
 * Admin API to create user profile
 */
async function apiAdminCreateUser(userData) {
  const res = await fetch(`${API_BASE_URL}/users`, getRequestOptions('POST', userData));
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to create user profile.');
  }
  return await res.json();
}

/**
 * Fetch exercise catalog
 */
async function apiGetTrainings() {
  const res = await fetch(`${API_BASE_URL}/trainings`, getRequestOptions('GET'));
  if (!res.ok) throw new Error('Failed to load trainings catalog.');
  return await res.json();
}

/**
 * Add exercise to catalog
 */
async function apiCreateTraining(type, name) {
  const res = await fetch(`${API_BASE_URL}/trainings`, getRequestOptions('POST', { type, name }));
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to add catalog exercise.');
  }
  return await res.json();
}

/**
 * Delete training catalog item (Super Admin only)
 */
async function apiDeleteCatalogTraining(trainingId) {
  const res = await fetch(`${API_BASE_URL}/trainings/${trainingId}`, getRequestOptions('DELETE'));
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete catalog item.');
  }
  return await res.json();
}

/**
 * Log workout session
 */
async function apiCreateSession(userId, sessionData) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/sessions`, getRequestOptions('POST', sessionData));
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to log workout session.');
  }
  return await res.json();
}

/**
 * Edit workout session
 */
async function apiUpdateSession(userId, sessionId, updateData) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/sessions/${sessionId}`, getRequestOptions('PUT', updateData));
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to update session.');
  }
  return await res.json();
}

/**
 * Delete session
 */
async function apiDeleteSession(userId, sessionId) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/sessions/${sessionId}`, getRequestOptions('DELETE'));
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete session.');
  }
  return await res.json();
}


/**
 * APPLICATION CONTROL FLOW & INITIALIZATION
 */

/**
 * Triggered upon successful login or registration
 */
async function handleAuthenticationSuccess(authResponse) {
  // 1. Save credentials in memory state
  AppState.token = authResponse.token;
  AppState.userId = Number(authResponse.user.id);
  AppState.userRole = authResponse.user.role;

  // 2. Adjust visibility of features depending on user access level
  adjustUIForRole();

  // 3. Load initial catalog data
  try {
    AppState.trainings = await apiGetTrainings();
    renderTrainingsCatalog();
    populateExerciseSelectDropdown();
  } catch (err) {
    console.error('Error loading exercises catalog:', err);
  }

  // 4. Load profiles depending on access level
  if (AppState.userRole === 'admin' || AppState.userRole === 'superadmin') {
    try {
      AppState.users = await apiGetUsers();
      renderUserSelectDropdown();
      
      // Auto-view the active user profile or Hilli Schlesinger if viewing
      const selfExists = AppState.users.find(u => u.id === AppState.userId);
      if (selfExists) {
        dom.userSelect.value = AppState.userId;
        await selectActiveUser(AppState.userId);
      } else if (AppState.users.length > 0) {
        dom.userSelect.value = AppState.users[0].id;
        await selectActiveUser(AppState.users[0].id);
      }
    } catch (err) {
      console.error('Error loading administrative list:', err);
    }
  } else {
    // Regular user: can only fetch themselves
    await selectActiveUser(AppState.userId);
  }

  // Reveal dashboard, hide auth overlays
  dom.authOverlay.classList.add('hidden');
  dom.appContainer.classList.remove('hidden');
}

/**
 * Dynamic UI Adjustment depending on user role
 * Uses display: none (CSS hidden class) to hide unauthorized controls
 */
function adjustUIForRole() {
  if (AppState.userRole === 'user') {
    // Hide user switcher and catalog addition form
    dom.userSelectContainer.classList.add('hidden');
    dom.btnShowAddUser.classList.add('hidden');
    dom.addCatalogForm.classList.add('hidden');
  } else if (AppState.userRole === 'admin') {
    // Show user switcher, show catalog addition form
    dom.userSelectContainer.classList.remove('hidden');
    dom.btnShowAddUser.classList.remove('hidden');
    dom.addCatalogForm.classList.remove('hidden');
  } else if (AppState.userRole === 'superadmin') {
    // Full visibility
    dom.userSelectContainer.classList.remove('hidden');
    dom.btnShowAddUser.classList.remove('hidden');
    dom.addCatalogForm.classList.remove('hidden');
  }
}

/**
 * Switches the actively viewed user profile
 */
async function selectActiveUser(userId) {
  try {
    const userObj = await apiGetUserProfile(userId);

    // Instantiate User using standard OOP Class (instantiates session subclasses)
    AppState.activeUser = new User(userObj.id, userObj.name, userObj.tel, userObj.role, userObj.sessions);
    AppState.activeSessions = AppState.activeUser.sessions;

    // Render active profile detail cards
    dom.displayUserName.textContent = AppState.activeUser.name;
    dom.displayUserTel.textContent = AppState.activeUser.tel;
    dom.displayUserRole.textContent = AppState.activeUser.role;

    // Apply role-specific badges styling classes
    dom.displayUserRole.className = 'badge-role';
    if (AppState.activeUser.role === 'superadmin') {
      dom.displayUserRole.classList.add('superadmin');
    } else if (AppState.activeUser.role === 'admin') {
      dom.displayUserRole.classList.add('admin');
    }

    // Reset forms
    clearFormErrors(dom.workoutSessionForm);
    dom.workoutSessionForm.reset();
    dom.dynamicAerobicFields.classList.add('hidden');
    dom.dynamicPowerFields.classList.add('hidden');

    // Rebuild lists, stats, and insights
    processAndRenderSessions();
    updateGlobalStats();
  } catch (err) {
    console.error('Error selecting user:', err);
  }
}

/**
 * Populates user list switcher dropdown
 */
function renderUserSelectDropdown() {
  dom.userSelect.innerHTML = '<option value="" disabled>Select User...</option>';
  AppState.users.forEach(user => {
    const opt = document.createElement('option');
    opt.value = user.id;
    opt.textContent = `${user.name} (${user.tel}) - ${user.role}`;
    dom.userSelect.appendChild(opt);
  });
}

/**
 * Calculates statistics cards
 */
function updateGlobalStats() {
  // Show total system users (admins only; for regular users it is hidden or 1)
  dom.statTotalUsers.textContent = AppState.userRole === 'user' ? 1 : AppState.users.length;

  if (!AppState.activeUser) {
    dom.statMaxWeight.innerHTML = `0 <span class="unit">kg</span>`;
    dom.statAvgAerobicTime.innerHTML = `0 <span class="unit">min</span>`;
    dom.statTotalPower.textContent = 0;
    return;
  }

  const sessions = AppState.activeSessions;
  
  // Power stats
  const powerSessions = sessions.filter(s => s.type === 'Power');
  dom.statTotalPower.textContent = powerSessions.length;

  if (powerSessions.length > 0) {
    const weights = powerSessions.map(s => s.weight);
    const maxWeight = Math.max(...weights);
    dom.statMaxWeight.innerHTML = `${maxWeight} <span class="unit">kg</span>`;
  } else {
    dom.statMaxWeight.innerHTML = `0 <span class="unit">kg</span>`;
  }

  // Aerobic stats
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
 * Evaluates performance statistics and updates the AI Insights panel
 */
function renderInsights() {
  dom.insightsGrid.innerHTML = '';

  if (!AppState.activeUser || AppState.activeSessions.length === 0) {
    dom.insightsGrid.innerHTML = `
      <div class="insight-item" style="grid-column: span 2; justify-content: center;">
        <p class="insight-text" style="color: var(--text-muted);">Not enough activity data to compile training insights.</p>
      </div>
    `;
    return;
  }

  const sessions = AppState.activeSessions;
  const totalCount = sessions.length;
  const powerSessions = sessions.filter(s => s.type === 'Power');
  const aerobicSessions = sessions.filter(s => s.type === 'Aerobic');

  const insights = [];

  // Insight 1: Power vs Aerobic ratio
  const powerPercentage = Math.round((powerSessions.length / totalCount) * 100);
  const aerobicPercentage = 100 - powerPercentage;
  insights.push({
    icon: '📊',
    text: `Your current workout balance is ${powerPercentage}% Power lifting and ${aerobicPercentage}% Aerobic cardio.`
  });

  // Insight 2: Peak Calorie Burn/Effort Workout
  const maxEffortSession = [...sessions].sort((a, b) => b.calculateEffortScore() - a.calculateEffortScore())[0];
  if (maxEffortSession) {
    const score = Math.round(maxEffortSession.calculateEffortScore());
    const label = maxEffortSession.type === 'Aerobic' ? 'kcal burned' : 'effort score';
    insights.push({
      icon: '🔥',
      text: `Your peak performance session was "${maxEffortSession.name}" on ${maxEffortSession.date} reaching ${score} ${label}.`
    });
  }

  // Insight 3: Muscle groups trends
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
      text: `You target the "${favoriteMuscle}" muscle group most, logging it in ${maxCount} power sessions.`
    });
  } else {
    insights.push({
      icon: '🏋️',
      text: 'Log your first Power lift workout to compile muscle group training insights.'
    });
  }

  // Insight 4: Calorie pacing metrics
  if (aerobicSessions.length > 0) {
    const avgCalories = (aerobicSessions.reduce((acc, curr) => acc + curr.calculateEffortScore(), 0) / aerobicSessions.length).toFixed(0);
    insights.push({
      icon: '🏃',
      text: `Your average aerobic session burns ${avgCalories} kcal. Keep pushing your cardiorespiratory endurance!`
    });
  } else {
    insights.push({
      icon: '🏃',
      text: 'Aerobic workouts burn calories and improve heart health. Try adding Treadmill Runs to your profile.'
    });
  }

  // Inject first 4 insights
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
 * Handle query conditions, run sorting, and refresh DOM cards
 */
function processAndRenderSessions() {
  let filtered = [...AppState.activeSessions];

  // 1. Query search
  if (AppState.searchQuery.trim() !== '') {
    const query = AppState.searchQuery.toLowerCase();
    filtered = filtered.filter(s => s.name.toLowerCase().includes(query));
  }

  // 2. Type filter
  if (AppState.filterType !== 'All') {
    filtered = filtered.filter(s => s.type === AppState.filterType);
  }

  // 3. Muscle filter
  if (AppState.filterMuscle !== 'All') {
    filtered = filtered.filter(s => s.type === 'Power' && s.muscleGroup === AppState.filterMuscle);
  }

  // 4. Sort
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

  renderSessionCards(filtered);
  renderInsights();
}

/**
 * Helper to get CSS class 'empty-field' if a value is empty, null, or undefined.
 * This ensures empty fields are hidden using display: none (none of CSS!)
 */
function emptyClass(value) {
  if (value === undefined || value === null || value === '') {
    return 'empty-field';
  }
  return '';
}

/**
 * Render cards list in DOM
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
    const valueScore = Math.round(session.calculateEffortScore());
    const scoreLabel = session.type === 'Aerobic' ? 'kcal burned' : 'effort score';

    const card = document.createElement('article');
    card.className = `workout-card glass-card ${session.type.toLowerCase()}`;
    card.setAttribute('data-session-id', session.sessionId);

    // Build details grid. Apply emptyClass helper to hide any empty properties
    let detailsHtml = '';
    if (session.type === 'Aerobic') {
      detailsHtml = `
        <div class="detail-item ${emptyClass(session.duration)}">
          <span class="detail-label">Duration</span>
          <span class="detail-value">${session.duration} min</span>
        </div>
        <div class="detail-item ${emptyClass(session.speed)}">
          <span class="detail-label">Speed</span>
          <span class="detail-value">${session.speed} km/h</span>
        </div>
        <div class="detail-item ${emptyClass(session.difficulty)}">
          <span class="detail-label">Difficulty</span>
          <span class="detail-value">${session.difficulty}</span>
        </div>
        <!-- Empty Power fields (explicitly hidden using emptyClass or omitted) -->
        <div class="detail-item empty-field">
          <span class="detail-label">Muscle</span>
          <span class="detail-value"></span>
        </div>
      `;
    } else if (session.type === 'Power') {
      detailsHtml = `
        <div class="detail-item ${emptyClass(session.muscleGroup)}">
          <span class="detail-label">Muscle</span>
          <span class="detail-value">${session.muscleGroup}</span>
        </div>
        <div class="detail-item ${emptyClass(session.weight)}">
          <span class="detail-label">Weight</span>
          <span class="detail-value">${session.weight} kg</span>
        </div>
        <div class="detail-item ${emptyClass(session.sets)}">
          <span class="detail-label">Sets</span>
          <span class="detail-value">${session.sets} sets</span>
        </div>
        <div class="detail-item ${emptyClass(session.reps)}">
          <span class="detail-label">Reps</span>
          <span class="detail-value">${session.reps} reps</span>
        </div>
      `;
    }

    // Role restrictions: 
    // - Regular user can edit/delete their own session.
    // - Super Admin can edit/delete anyone.
    // - Staff Admin can never delete sessions.
    const isOwner = AppState.userId === AppState.activeUser.id;
    const canDelete = AppState.userRole === 'superadmin' || (AppState.userRole === 'user' && isOwner);
    const canEdit = AppState.userRole === 'superadmin' || (AppState.userRole === 'user' && isOwner);

    const deleteBtnHtml = canDelete 
      ? `<button type="button" class="btn btn-danger btn-icon-only" onclick="handleDeleteSessionClick('${session.sessionId}')">Delete</button>` 
      : '';
    const editBtnHtml = canEdit 
      ? `<button type="button" class="btn btn-secondary btn-icon-only btn-edit" onclick="handleEditSessionClick('${session.sessionId}')">Edit</button>` 
      : '';

    card.innerHTML = `
      <div class="card-header-row">
        <div class="card-title-group">
          <h3 class="card-exercise-name">${session.name}</h3>
          <span class="card-date">🗓️ ${session.date}</span>
        </div>
        <div class="card-effort-badge">
          <span class="effort-val">${valueScore}</span>
          <span class="effort-lbl">${scoreLabel}</span>
        </div>
      </div>

      <div class="card-details-grid">
        ${detailsHtml}
      </div>

      <div class="card-actions-row ${emptyClass(deleteBtnHtml && editBtnHtml)}">
        ${editBtnHtml}
        ${deleteBtnHtml}
      </div>
    `;

    dom.sessionsContainer.appendChild(card);
  });
}

/**
 * Render trainings catalog in sidebar
 */
function renderTrainingsCatalog() {
  dom.catalogList.innerHTML = '';
  
  AppState.trainings.forEach(item => {
    const li = document.createElement('li');
    li.className = 'catalog-item';
    
    // Superadmin has access to delete exercises, others do not
    const showDeleteBtn = AppState.userRole === 'superadmin';
    const deleteBtn = showDeleteBtn 
      ? `<button type="button" class="btn-catalog-delete" onclick="handleDeleteCatalogItemClick(${item.id})" title="Delete Exercise Category">🗑️</button>` 
      : '';

    li.innerHTML = `
      <span class="catalog-item-name">${item.name}</span>
      <div class="catalog-badge-row">
        <span class="badge-type ${item.type.toLowerCase()}">${item.type}</span>
        ${deleteBtn}
      </div>
    `;
    dom.catalogList.appendChild(li);
  });
}

/**
 * Populate Exercise Selector dropdown in form
 */
function populateExerciseSelectDropdown() {
  dom.sessionExerciseSelect.innerHTML = '<option value="" disabled selected>Choose from catalog...</option>';
  AppState.trainings.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `${item.name} (${item.type})`;
    dom.sessionExerciseSelect.appendChild(opt);
  });
}


/**
 * FORM VALIDATION AND UTILITIES
 */
function showInputError(element, message) {
  if (element) {
    element.textContent = message;
  }
}

function clearFormErrors(formElement) {
  const errors = formElement.querySelectorAll('.error-msg');
  errors.forEach(e => e.textContent = '');
}


/**
 * EVENT HANDLERS & INTERACTIONS BINDINGS
 */

// Toggle registration mode inside auth overlay
dom.linkShowRegister.addEventListener('click', (e) => {
  e.preventDefault();
  clearFormErrors(dom.loginForm);
  dom.loginForm.classList.add('hidden');
  dom.registerForm.classList.remove('hidden');
  dom.authSubtitle.textContent = 'Create a secure PulseFit profile';
});

// Toggle login mode inside auth overlay
dom.linkShowLogin.addEventListener('click', (e) => {
  e.preventDefault();
  clearFormErrors(dom.registerForm);
  dom.registerForm.classList.add('hidden');
  dom.loginForm.classList.remove('hidden');
  dom.authSubtitle.textContent = 'Sign in to track your gym progress';
});

// Login Form Submit handler
dom.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(dom.loginForm);

  const username = dom.loginUsername.value.trim();
  const password = dom.loginPassword.value;

  let valid = true;
  if (!username) {
    showInputError(dom.loginUsernameError, 'Username or telephone contact is required.');
    valid = false;
  }
  if (!password) {
    showInputError(dom.loginPasswordError, 'Password is required.');
    valid = false;
  }

  if (!valid) return;

  try {
    const authRes = await apiLogin(username, password);
    await handleAuthenticationSuccess(authRes);
  } catch (err) {
    showInputError(dom.loginPasswordError, err.message || 'Invalid username or password.');
  }
});

// Registration Form Submit handler
dom.registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(dom.registerForm);

  const name = dom.registerName.value.trim();
  const tel = dom.registerTel.value.trim();
  const password = dom.registerPassword.value;

  let valid = true;
  if (!name) {
    showInputError(dom.registerNameError, 'Full name is required.');
    valid = false;
  }
  if (!tel) {
    showInputError(dom.registerTelError, 'Telephone contact is required.');
    valid = false;
  } else if (!/^[0-9\-+ ]{7,15}$/.test(tel)) {
    showInputError(dom.registerTelError, 'Provide a valid phone format.');
    valid = false;
  }
  if (!password || password.length < 4) {
    showInputError(dom.registerPasswordError, 'Password must be at least 4 characters.');
    valid = false;
  }

  if (!valid) return;

  try {
    const authRes = await apiRegister(name, tel, password);
    await handleAuthenticationSuccess(authRes);
  } catch (err) {
    showInputError(dom.registerPasswordError, err.message || 'Failed to register account.');
  }
});

// Log Out Handler
dom.btnLogout.addEventListener('click', () => {
  // Wipe runtime token memory
  AppState.token = null;
  AppState.userRole = null;
  AppState.userId = null;
  AppState.users = [];
  AppState.activeUser = null;
  AppState.activeSessions = [];

  // Reset forms
  dom.loginForm.reset();
  dom.registerForm.reset();
  dom.loginForm.classList.remove('hidden');
  dom.registerForm.classList.add('hidden');
  dom.authSubtitle.textContent = 'Sign in to track your gym progress';

  // Toggle screens
  dom.appContainer.classList.add('hidden');
  dom.authOverlay.classList.remove('hidden');
});

// Switch active viewed user (Admins/Superadmins only)
dom.userSelect.addEventListener('change', (e) => {
  selectActiveUser(e.target.value);
});

// Show Create User Modal
dom.btnShowAddUser.addEventListener('click', () => {
  clearFormErrors(dom.addUserForm);
  dom.addUserForm.reset();
  
  // Staff Admin can create 'user' role only. Super Admin can create 'admin' as well.
  if (AppState.userRole === 'admin') {
    document.getElementById('new-user-role-field').classList.add('hidden');
  } else {
    document.getElementById('new-user-role-field').classList.remove('hidden');
  }

  dom.addUserModal.classList.remove('hidden');
});

dom.btnCancelAddUser.addEventListener('click', () => {
  dom.addUserModal.classList.add('hidden');
});

// Administrative Create User profile submission
dom.addUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormErrors(dom.addUserForm);

  const name = dom.newUserName.value.trim();
  const tel = dom.newUserTel.value.trim();
  const password = dom.newUserPassword.value;
  const role = dom.newUserRole.value;

  let valid = true;
  if (!name) {
    showInputError(dom.newUserNameError, 'Name is required.');
    valid = false;
  }
  if (!tel) {
    showInputError(dom.newUserTelError, 'Contact tel is required.');
    valid = false;
  } else if (!/^[0-9\-+ ]{7,15}$/.test(tel)) {
    showInputError(dom.newUserTelError, 'Provide a valid phone format.');
    valid = false;
  }
  if (!password || password.length < 4) {
    showInputError(dom.newUserPasswordError, 'Password must be at least 4 characters.');
    valid = false;
  }

  if (!valid) return;

  try {
    const payload = { name, tel, password };
    if (AppState.userRole === 'superadmin') {
      payload.role = role;
    } else {
      payload.role = 'user'; // Staff admin defaults to user
    }

    const createdUser = await apiAdminCreateUser(payload);
    
    // Refresh local lists
    AppState.users.push(createdUser);
    renderUserSelectDropdown();
    
    // Auto switch to view the created user profile
    dom.userSelect.value = createdUser.id;
    await selectActiveUser(createdUser.id);

    dom.addUserModal.classList.add('hidden');
  } catch (err) {
    showInputError(dom.newUserPasswordError, err.message || 'Error creating user profile.');
  }
});

// Catalog exercises additions
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
    const createdTraining = await apiCreateTraining(type, name);
    AppState.trainings.push(createdTraining);

    renderTrainingsCatalog();
    populateExerciseSelectDropdown();
    dom.addCatalogForm.reset();
  } catch (err) {
    showInputError(dom.catalogNameError, err.message || 'Error adding item.');
  }
});

// Delete Catalog item (Superadmin only)
window.handleDeleteCatalogItemClick = async function(trainingId) {
  const confirmDel = confirm('Are you sure you want to delete this exercise category from the catalog? This will affect new logged sessions.');
  if (!confirmDel) return;

  try {
    await apiDeleteCatalogTraining(trainingId);
    AppState.trainings = AppState.trainings.filter(t => t.id !== trainingId);

    renderTrainingsCatalog();
    populateExerciseSelectDropdown();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Error deleting catalog item.');
  }
};

// Form Dynamic Inputs toggles on exercise selection
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
    showInputError(dom.sessionExerciseError, 'No active user selected.');
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
    showInputError(dom.sessionDateError, 'Choose a date.');
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
        showInputError(dom.aerobicDurationError, 'Positive duration required.');
        valid = false;
      }
      if (!spd || Number(spd) <= 0) {
        showInputError(dom.aerobicSpeedError, 'Positive speed required.');
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
    const instantiatedSession = mapSession(savedSessionObj);

    // Update state and refresh
    AppState.activeSessions.push(instantiatedSession);
    
    // Sync within AppState.users list
    const uIdx = AppState.users.findIndex(u => u.id === AppState.activeUser.id);
    if (uIdx !== -1) {
      AppState.users[uIdx].sessions.push(savedSessionObj);
    }

    processAndRenderSessions();
    updateGlobalStats();

    // Reset Form
    dom.workoutSessionForm.reset();
    dom.dynamicAerobicFields.classList.add('hidden');
    dom.dynamicPowerFields.classList.add('hidden');
  } catch (err) {
    showInputError(dom.sessionExerciseError, err.message || 'Error saving session.');
  }
});

// Filters search, type, and muscle change handlers
dom.searchInput.addEventListener('input', (e) => {
  AppState.searchQuery = e.target.value;
  processAndRenderSessions();
});

dom.filterType.addEventListener('change', (e) => {
  AppState.filterType = e.target.value;
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
window.handleEditSessionClick = function(sessionId) {
  const session = AppState.activeSessions.find(s => s.sessionId === sessionId);
  if (!session) return;

  AppState.editingSessionId = sessionId;
  clearFormErrors(dom.editSessionForm);

  dom.editSessionName.value = session.name;
  dom.editSessionDate.value = session.date;

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

dom.btnCancelEditSession.addEventListener('click', () => {
  dom.editSessionModal.classList.add('hidden');
  AppState.editingSessionId = null;
});

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

    // Sync state
    const sessionIdx = AppState.activeSessions.findIndex(s => s.sessionId === AppState.editingSessionId);
    if (sessionIdx !== -1) {
      AppState.activeSessions[sessionIdx] = updatedInstance;
    }

    const uIdx = AppState.users.findIndex(u => u.id === AppState.activeUser.id);
    if (uIdx !== -1) {
      const sIdx = AppState.users[uIdx].sessions.findIndex(s => s.sessionId === AppState.editingSessionId);
      if (sIdx !== -1) {
        AppState.users[uIdx].sessions[sIdx] = updatedRawSession;
      }
    }

    processAndRenderSessions();
    updateGlobalStats();

    dom.editSessionModal.classList.add('hidden');
    AppState.editingSessionId = null;
  } catch (err) {
    showInputError(dom.editSessionDateError, err.message || 'Error updating session.');
  }
});

// Delete workout session
window.handleDeleteSessionClick = async function(sessionId) {
  if (!AppState.activeUser) return;

  const confirmDel = confirm('Are you sure you want to delete this workout session?');
  if (!confirmDel) return;

  try {
    await apiDeleteSession(AppState.activeUser.id, sessionId);

    // Filter local state
    AppState.activeSessions = AppState.activeSessions.filter(s => s.sessionId !== sessionId);
    
    const uIdx = AppState.users.findIndex(u => u.id === AppState.activeUser.id);
    if (uIdx !== -1) {
      AppState.users[uIdx].sessions = AppState.users[uIdx].sessions.filter(s => s.sessionId !== sessionId);
    }

    processAndRenderSessions();
    updateGlobalStats();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Error deleting session.');
  }
};
