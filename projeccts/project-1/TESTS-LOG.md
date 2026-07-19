# Test Log & Scenarios: PulseFit Gym Tracker

Tests performed to verify requirements outlined in `SPEC.md`.

## Test Scenarios & Results

### 1. Database & ID Persistence Verification
- **Scenario**: Start Express backend with pre-populated users (IDs 1, 2) and catalog exercises (IDs 1-7). Create a new user and add a new training exercise to catalog.
- **Expected Result**: 
  - User's counter starts at 3; new user is assigned ID 3.
  - Exercises counter starts at 8; new exercise is assigned ID 8.
- **Result**: **PASS**. Backend properly scans maximum existing IDs on boot and increments counter without collision.

### 2. OOP Class and Polymorphism Behavior
- **Scenario**: Log a Treadmill run (Aerobic) of 30 minutes at 10 km/h, and a Bench Press (Power) of 4 sets, 10 reps, at 80 kg.
- **Expected Result**:
  - Treadmill: `calculateEffortScore()` returns 300 (`duration * speed`).
  - Bench Press: `calculateEffortScore()` returns 3200 (`sets * reps * weight`).
- **Result**: **PASS**. The objects are successfully mapped to their respective subclass instances, and correct calculation methods are triggered.

### 3. Dynamic UI and Input Handling
- **Scenario**: Choose a Power exercise from dropdown.
- **Expected Result**: Power training fields (Muscle, weight, sets, reps) are displayed; Aerobic fields (duration, speed, difficulty) are hidden.
- **Result**: **PASS**. Transition updates instantly and updates display on exercise change.

### 4. Input Robustness
- **Scenario**: Log a session passing numerical values as Strings (e.g., weight `"90"`, sets `"4"`).
- **Expected Result**: Backend and frontend convert strings into numbers safely and write them as numbers in `users.json`.
- **Result**: **PASS**. Both client and server parse inputs through safe numeric parsers.

### 5. Validation Controls
- **Scenario**: Submit empty name or invalid phone inside "Add User" form.
- **Expected Result**: Validation text displays under fields. No browser `alert()` popups appear.
- **Result**: **PASS**. Errors render visually inside inline target tags.

### 6. Combined Search & Filtering
- **Scenario**: Filter by "Power Only", select muscle group "Chest", and search "Bench".
- **Expected Result**: Only the Bench Press session card remains visible.
- **Result**: **PASS**. Combinable filter state is fully responsive.
