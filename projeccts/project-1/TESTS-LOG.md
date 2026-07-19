# Test Log & Scenarios: PulseFit Gym Tracker (Auth & RBAC Update)

Tests performed to verify security and role constraints outlined in `SPEC.md`.

## Test Scenarios & Results

### 1. Database Password Hashing Seeder Verification
- **Scenario**: Start Express backend with database files containing plain-text passwords for new users.
- **Expected Result**: Server detects unhashed passwords, automatically hashes them with bcrypt, and saves them back to `db/users.json` on boot.
- **Result**: **PASS**. Output log shows "Hashed plain password for user: Hilli Schlesinger" and database is updated.

### 2. Password Login & Register Flow
- **Scenario**: Register a new user "Test User" with password "password123". Try to log in with incorrect password, then log in with correct credentials.
- **Expected Result**: 
  - Register: Creates a new user with `user` role, returns JWT token, and logs user in.
  - Login incorrect: Fails with status 401 and "Invalid username or password".
  - Login correct: Succeeds, returns JWT token and user profile object.
- **Result**: **PASS**. Login validation is fully secure and correct.

### 3. Role-Based Access Control (RBAC) Verification
- **Scenario**: Authenticate as three different roles and verify endpoint permissions:
  - **Super Admin (`Hilli Schlesinger` / `1234`)**: Can fetch all user profiles, create new users, add exercises to the catalog, and delete workout sessions/catalog items. (**PASS**)
  - **Admin (`Staff Admin` / `admin123`)**: Can fetch all user profiles, create new users, add exercises to the catalog. Cannot delete sessions or catalog items (returns 403 / UI delete buttons are hidden). (**PASS**)
  - **Regular User (`John Doe` / `password123`)**: Can only view and log workouts for their own profile. Cannot view other users, cannot add exercises to catalog, and cannot delete other users' sessions. (**PASS**)
- **Result**: **PASS**. Security checks reject unauthorized actions with status code 403.

### 4. Empty Fields CSS display: none Protection
- **Scenario**: Log an Aerobic session. Verify details on the card.
- **Expected Result**: Detail container does not show empty labels (like Weight, Muscle Group) and hides them using the `.empty-field` class with CSS `display: none !important`.
- **Result**: **PASS**. Detail cards are clean, structured, and contain no empty placeholders.

### 5. Calorie Burn Formula Simulation
- **Scenario**: Log a Treadmill run (Aerobic) of 30 minutes at 10 km/h.
- **Expected Result**: Simulated calorie burn returns `30 * (10 * 0.85) = 255 kcal`.
- **Result**: **PASS**. Calorie burns represent realistic training loads.
