# תוכנית פרויקט: לוח בקרה למעקב כושר (אימות ו-RBAC)

- **פרויקט:** `project-2`, מעקב אימוני כושר (gym training tracker)
- **מקור האמת:** [`SPEC.md`](SPEC.md). לעולם אל תערוך אותו כדי שיתאים לקוד; הוא משתנה רק כאשר הדרישות משתנות. אם תוכנית זו והמפרט סותרים זה את זה, המפרט קובע: תקן את התוכנית, לא את המפרט.
- **טכנולוגיות (Stack):** Node.js v20+, Express, `cors`, `bcryptjs`, `jsonwebtoken`, Vanilla HTML/CSS/JS, `node:test` + `node:assert`
- **תוצרים למסירה (§12):** `client/`, `server/`, `README.md`, `AI-LOG.md`, `TESTS-LOG.md`
- **גרסת תוכנית:** 1.1, 2026-10-09
- **שינויים בגרסה 1.1:** צעד 3 במשימה 3.2 מנוסח עכשיו כך שחוזה המתודה האבסטרקטית ברור. האפשרות החדשה **כלול שריפת קלוריות (Include calorie burn)** לתרגילים אירוביים (SPEC §3.5) נוספה למשימות הרלוונטיות ולנספח.

מסמך זה הופך את המפרט לתוכנית בנייה מסודרת שלב-אחר-שלב. עבור עליה שלב אחר שלב ומשימה אחר משימה. כל משימה מתאימה לישיבת עבודה אחת ול-commit אחד, ומשאירה את הפרויקט עובד ונבדק.

**תוכן העניינים:** [סקירה כללית](#overview) · [איך להשתמש בתוכנית זו](#how-to-use-this-plan) · [הגדרת סיום (Definition of Done)](#definition-of-done) · [מפת דרכים (Roadmap)](#roadmap) · [הבהרות למפרט](#spec-clarifications-decision-register) · שלבים 0–13 · [נספח: מפת בדיקות קבלה](#appendix-acceptance-checklist-map-14)

---

## סקירה כללית (Overview)

**מה אנחנו בונים:** מעקב אימוני כושר בעמוד יחיד (SPA), המוגש על ידי API של Express ב-`http://localhost:3000`. משתמשים נרשמים ומתחברים (bcrypt + JWT). הם מתעדים אימוני **כוח (Power)** ו**אירובי (Aerobic)** אל מול קטלוג תרגילים משותף וגולשים בהם ככרטיסיות הניתנות לסינון עם נתונים סטטיסטיים ותובנות. אדמינים וסופר-אדמינים יכולים להפעיל הערכת שריפת קלוריות עבור תרגילים אירוביים מסוימים (§3.5). שלושה תפקידים (`superadmin`, `admin`, `user`) נאכפים בכל נתיב (route) ובכל פקד בממשק המשתמש (UI) (§2.2).

```text
Browser: client/ (index.html · style.css · script.js)
   │  fetch + "Authorization: Bearer <JWT>"   (token held in a JS variable only)
   ▼
Express: server.js → routes/ → middlewares/ (auth · roles · ownership · validation)
   │  class instances in memory: models/ (User · Training · BaseSession · AerobicSession · PowerSession)
   ▼
JSON files: server/db/ (users.json · trainings.json · options.json), written via writeDB()
```

**היקף פרויקט במבט מהיר**

| פריט | כמות | מפרט (Spec) |
|---|---|---|
| תפקידים (Roles) | 3 | §2 |
| מחלקות מודל | 5: `User`, `Training`, `BaseSession`, `AerobicSession`, `PowerSession` | §3 |
| פונקציות קלוריות | 7, בנוסף לקבוע `REFERENCE_BODY_WEIGHT_KG` | §3.4 |
| קבצי Middleware / ייצוא | 4 / 11 | §6 |
| ראוטרים / נקודות קצה (endpoints) | 5 / 15 | §8 |
| פונקציות טהורות בצד לקוח | 9 | §11 |
| קבוצות בדיקה אוטומטיות | 8 | §13 |
| בדיקות קבלה ידניות | 37 | §14 |

**דרישות קדם (Prerequisites)**
- Node.js v20 או חדש יותר (`node -v`) ו-npm.
- Git, עובד בתוך מאגר `homework-to-github`.
- דפדפן מודרני עם DevTools (סרגל הכלים למכשירים משמש לבדיקות רספונסיביות).
- אופציונלי: לקוח HTTP לבדיקות API ידניות (`curl` או PowerShell `Invoke-RestMethod`).

---

## איך להשתמש בתוכנית זו (How to Use This Plan)

**סדר.** השלבים הם רציפים: כל אחד נבנה על קודמו ומסתיים כשהכל ירוק (תקין). המשימות בתוך שלב רצות לפי הסדר. שלב 9 (לוגיקה טהורה בצד לקוח) תלוי רק בקבועים משלב 5, כך שתוכל להקדים אותו אם תרצה שינוי בקצב.

**פורמט משימה.** כל משימה משתמשת באותם בלוקים:

| בלוק | משמעות |
|---|---|
| **קבצים · מפרט** | קבצים שנוצרו (new) או שונו (edit), וסעיפי ה-SPEC.md שהמשימה מיישמת |
| **צעדים (Steps)** | מה לעשות, לפי הסדר |
| **בדיקות (Tests)** | מה להוסיף ל-`server/tests/system.test.js`, ותחת איזו קבוצה מ-§13 |
| **שים לב (Watch out)** | מלכודות ידועות, מופיעות רק היכן שהן קיימות |
| **המשימה הושלמה כאשר (Done when)** | תיבות סימון. המשימה מסתיימת כשכל התיבות מסומנות |

**הבדיקות חיות עם הקוד.** §13 דורש בדיקה לכל פונקציה: *"אם אתה מוסיף פונקציה, אתה מוסיף עבורה בדיקה."* לכן, כל משימה מוסיפה את הבדיקות שלה באותו commit. אין שלב בדיקות נפרד. קובץ הבדיקות מאורגן ל-8 הקבוצות של §13 החל ממשימה 1.6 ואילך.

**משימה אחת = commit אחד.** שלב 0 מסתיים ב-commit בסיס אחד. משלב 1 ואילך, עבוד על ענף `project-2` ובצע commit כשכל התיבות של המשימה מסומנות:

```bash
git commit -m "[3.2] Add BaseSession with its own sessionId counter"
```

פתח Pull Request לתוך `master` לאחר שלב 13.

**עבודה עם עוזר AI.** ה-SPEC.md נכתב כהנחיית מערכת (system prompt) ל-AI, ו-§12 דורש `AI-LOG.md` של ההנחיות (prompts) בהם השתמשת. תן לעוזר ה-AI משימה אחת לכל פקודה:

```text
Read SPEC.md (source of truth, do not modify it) and project.md (build plan).
Implement Task <X.Y>: <title>, exactly as described in project.md.
Follow every SPEC.md rule. Keep spec names exactly as written. Put explanations in code comments only.
Add the task's tests to server/tests/system.test.js (<group> group) and run: cd server && npm run test
Report: files changed, the test summary, and any spec gap you resolved.
```

לאחר מכן, תעד את ההנחיה והתוצאה שלה ב-`AI-LOG.md` (משימה 0.2), ובדוק את הקוד שנוצר לפני ה-commit.

**שער שלב (Stage gate).** כל שלב החל משלב 1 מסתיים באותה שגרה:
1. הפקודה `cd server && npm run test` מסתיימת עם קוד 0.
2. `TESTS-LOG.md` מקבל רשומת *Automated Test Runs* חדשה, וכל בדיקת §14 שהשלב אימת מעודכנת.
3. `AI-LOG.md` מכיל כל הנחיה (prompt) והחלטה מהשלב.
4. בצע commit לעדכוני הלוגים: `git commit -m "[3] Stage 3 gate: tests green, logs updated"`.

**לעולם אל תערוך את SPEC.md כדי שיתאים לקוד.** הוא משתנה רק כאשר הדרישות משתנות (כמו בגרסה 1.1 של התוכנית). SPEC.md אומר: *"אם משהו לא מכוסה כאן, בחר באפשרות הפשוטה ביותר שלא מפרה אף כלל למטה, ותעד החלטה זו ב-AI-LOG.md."* ה-[הבהרות למפרט](#spec-clarifications-decision-register) למטה כבר מיישבות את הפערים שנמצאו במהלך התכנון. כשאתה מיישם אחת מהן, העתק את ה-ID שלה (למשל `D-09`) אל תוך יומן ההחלטות (Decision Log) ב-AI-LOG. מספֵּר החלטות חדשות מ-`D-19`.

---

## הגדרת סיום (Definition of Done)

כל משימה חייבת לעמוד בכל אלה, בנוסף לרשימת **Done when** שלה:

- השמות תואמים בדיוק ל-SPEC.md: מחלקות, שדות, פונקציות, middleware, נתיבים וקבצים (§11).
- נעשה שימוש אך ורק בטכנולוגיות המותרות (§10): ללא frameworks, ללא ספריות צד-לקוח, ללא ספריות בדיקה צד-שלישי.
- ללא `localStorage`, `sessionStorage`, cookies, `alert()` או `confirm()` (§7, §9, §10).
- הסברים הם הערות קוד בלבד, לא טקסט נפרד (§11).
- קוד השרת משתמש ב-CommonJS, ב-`const`/`let` (לעולם לא `var`) וב-`async/await`. כל מטפל נתיב (route handler) עטוף ב-`try/catch` ומחזיר `500 { error }` בכשלים בלתי צפויים (§11).
- כל פונקציה חדשה ומתודת מחלקה מיוצאת (בשרת) או רשומה ב-`module.exports` (לוגיקה טהורה בלקוח), ויש לה לפחות בדיקה אחת (§13).
- כל תגובת שגיאה היא בתבנית `{ "error": "<message>" }`, ואף תגובה אינה מכילה `password` (§6, §8).
- הפקודה `cd server && npm run test` מסתיימת עם קוד 0.
- ההנחיה (prompt) ששימשה, אם קיימת, וכל החלטה שהתקבלה, מתועדות ב-`AI-LOG.md`.

---

## מפת דרכים (Roadmap)

| שלב | נושא | תוצר עיקרי | מפרט (Spec) |
|:---:|---|---|---|
| [0](#stage-0-project-tracking-files) | קבצי מעקב פרויקט | `README.md`, `AI-LOG.md`, `TESTS-LOG.md` | §12, §14 |
| [1](#stage-1-scaffolding--test-harness) | שלד (Scaffolding) וסביבת בדיקות | עץ תיקיות, `package.json`, שלד `server.js`, נתוני seed, סביבת בדיקות | §5, §10, §12, §13 |
| [2](#stage-2-calorie-engine) | מנוע קלוריות | `utils/calories.js` | §3.4 |
| [3](#stage-3-domain-models) | מודלי דומיין | `models/Training.js`, `models/Session.js`, `models/User.js` | §3 |
| [4](#stage-4-persistence-layer) | שכבת התמדה (Persistence) | `utils/db.js` | §3.3, §5 |
| [5](#stage-5-input-validation) | אימות קלט (Validation) | `middlewares/validation/validate.js` | §4 |
| [6](#stage-6-authentication--access-middlewares) | Middlewares של אימות (Auth) וגישה | `authenticate.js`, `authorize.js`, `ownership.js` | §6 |
| [7](#stage-7-rest-api) | API מסוג REST | `routes/*.routes.js` (5 ראוטרים, 15 נקודות קצה) | §8 |
| [8](#stage-8-rbac-verification--hardening) | אימות RBAC והקשחה | קבוצת בדיקות RBAC, סקירת אבטחה | §2.2, §6, §13 |
| [9](#stage-9-client-pure-logic) | לוגיקה טהורה בלקוח | פונקציות טהורות ב-`client/script.js` | §11, §13 |
| [10](#stage-10-client-shell--authentication-ui) | מעטפת הלקוח וממשק התחברות | `index.html`, `style.css`, תהליך התחברות, מחזור חיי טוקן | §7, §9, §10 |
| [11](#stage-11-sessions-dashboard) | לוח בקרה לאימונים (Sessions dashboard) | הוספה, רשימה, עריכה, מחיקה, סינון, מיון, סטטיסטיקות, תובנות | §9 |
| [12](#stage-12-catalog--administration-ui) | קטלוג וממשק ניהול | טופס תרגיל (תהליך קבוצת שרירים, אפשרות קלוריות), ניהול משתמשים | §2.2, §3.5, §9 |
| [13](#stage-13-qa--delivery) | הבטחת איכות (QA) ומסירה | ביקורות, רשימת תיוג ידנית, מסמכים סופיים, Pull request | §12, §13, §14 |

---

## הבהרות למפרט (Decision Register)

SPEC.md אינו עונה על כל שאלה שתיתקל בה. אלו התשובות המומלצות, כאשר כל אחת נבחרה כאפשרות הפשוטה ביותר ששומרת על כל כלל מפרט. הן ברירות מחדל, לא דרישות חדשות. אם תבחר אחרת, רשום במקום זאת את הבחירה שלך. כך או כך, תעד את ההחלטה ב-Decision Log שב-AI-LOG כאשר המשימה שדורשת אותה תושלם. אף אחת מהן לא משנה את SPEC.md.

| ID | נושא | החלטה מומלצת | מפרט | משימה |
|---|---|---|---|---|
| D-01 | שם קובץ יומן בדיקות | השתמש ב-`TESTS-LOG.md` (ברבים), בדיוק כפי ש-§12 ו-§14 מאייתים זאת. | §11, §12 | 0.3 |
| D-02 | מסמך תכנון | `project.md` יושב לצד `SPEC.md` כמסמך תכנון. הוא אינו חלק מעץ הקוד של §12 ושום קוד לא תלוי בו. | §12 | 0.2 |
| D-03 | תיקייה זמנית לבדיקות | צור אותה עם `fs.mkdtemp(path.join(os.tmpdir(), 'fitness-'))`. | §13 | 1.6 |
| D-04 | שגיאות מחוץ לנתיבים | נתיבי `/api/*` לא ידועים יחזירו `404 { error }`. גופי JSON פגומים יחזירו `400 { error }` דרך middleware סופי לטיפול בשגיאות. | §6 | 1.3 |
| D-05 | מודל התמדה (Persistence) | `loadAll()` רץ פעם אחת בהפעלה וטוען אובייקטים לזיכרון. כל שינוי נכתב ישירות עם `writeDB()`. | §3.3, §5 | 4.3 |
| D-06 | איפוס מזהה קטלוג (Reseed) | ה-`Training.idCounter` יתעדכן לפי ה-id הגבוה ביותר הקיים בקטלוג או ב-`trainingId` של האימונים. | §3.3 | 4.3 |
| D-07 | שמירת ערכים מחושבים | הפונקציה `toJSON()` של כל אימון מוסיפה `effortScore` ו-`calories` (§3.5). הערכים עשויים להופיע בקובץ, אך יחושבו מחדש תמיד בעת טעינה. | §3 | 3.3 |
| D-08 | 400 מול 403, 404, 409 | חוקי אימות Validation מחזירים `400`. אם רשומה לא קיימת ב-PUT מוחזר `404`. כפילויות (`409`) ובדיקות הרשאות (`403`) שייכות לנתיב עצמו. | §4, §6, §8 | 5.x, 7.x |
| D-09 | `role` בגוף הרישום | התעלם. הרשמה תמיד יוצרת `role: 'user'`. | §2.2 | 7.1 |
| D-10 | בדיקת התחברות | מצא התאמת `name` ללא רווחים מיותרים ובצורה לא תלוית-רישיות (case-insensitive). | §4, §6 | 7.1 |
| D-11 | שיפוע/התנגדות לא בשימוש | `undefined`, `null` ו-`''` נשמרים כ-`null`. כל ערך אחר בשדה שהפעילות לא משתמשת בו → `400`. | §4 | 5.4 |
| D-12 | אימות הקשר אימון | ב-POST: שדות ה-type ו-activity נלקחים מהקטלוג לפי `trainingId`. ב-PUT: הם נלקחים מהאימון השמור. `type`, `activity` או `includeCalories` בגוף בקשת PUT חייבים להיות זהים לערך השמור או להיעדר (אחרת `400`). | §4, §8 | 5.4 |
| D-13 | שריר `muscleGroup` | ב-POST: ערך חסר מקבל את הדיפולט של הקטלוג. | §3.2, §4 | 5.4, 7.5 |
| D-14 | שגיאת 403 לפני 404 | בדיקת גישה קודמת לקיום הרשומה (Middleware לפי סדר). משתמש רגיל שמבקש מידע של משתמש אחר מקבל `403` לפני `404`. | §8 | 6.3, 7.4 |
| D-15 | "לא בעתיד" | השווה מחרוזת תאריך `YYYY-MM-DD` מול תאריך השרת המקומי, לא UTC. תאריך בלתי אפשרי יחזיר `400`. | §4 | 5.1 |
| D-16 | פונקציות עזר ל-JWT | `signToken()` יושב ב-`authenticate.js`. `authenticateToken` מחזיר גם `401` כאשר המשתמש בטוקן כבר לא קיים במסד. | §6 | 6.1 |
| D-17 | פאנל משתמשים | יש להוסיף רשימת משתמשים מינימלית עבור מנהלים וסופר-אדמינים. | §2.2, §9 | 12.5 |
| D-18 | תובנות ברירת מחדל | לכל תובנה (insight) יהיה משפט fallback, כך ש-`buildInsights` תחזיר תמיד לפחות 4 משפטים, גם בלי נתונים. | §9, §13 | 9.5 |

---

## שלב 0: קבצי מעקב פרויקט

**מטרה:** ליצור את שלושת מסמכי המעקב ש-§12 דורש לפני כתיבת קוד כלשהו, כך שלכל משימה מאוחרת יותר יהיה מקום לתעד הנחיות (prompts), החלטות ותוצאות בדיקות. שלושתם יושבים בשורש הפרויקט, לצד `SPEC.md`.

### משימה 0.1: יצירת `README.md`

**קבצים:** `README.md` (חדש) · **מפרט:** §3.3, §12

**צעדים**
1. צור `README.md` בשורש הפרויקט.
2. הוסף את הסעיפים הבאים:
   - **כותרת ותקציר (Title and summary):** לוח בקרה למעקב אימוני כושר שנבנה עם Vanilla JS ו-Express, עם התחברות באמצעות סיסמה ובקרת גישה מבוססת תפקידים (RBAC).
   - **טכנולוגיות (Tech stack):** הרשימה המותרת מסעיף §10.
   - **דרישות קדם:** Node.js v20+.
   - **התקנה והפעלה (Setup & run):** `cd server`, `npm install`, `npm start`, ואז פתח את `http://localhost:3000`.
   - **הרצת בדיקות:** `cd server && npm run test`.
   - **תפקידים ופרטי התחברות ברירת מחדל** (טבלה מ-§2.1): סופר-אדמין `Hilli Schlesinger` / `1234`, אדמין `Staff Admin` / `admin123`. משתמשים רגילים נוצרים דרך הרשמה (Register).
   - **הערה על ציון מאמץ** (§3.3): הציון הוא חסר יחידות ומעוגל לנקודה עשרונית אחת. אימוני אירובי מעניקים ניקוד של קלוריות מוערכות (נוסחאות ACSM, משקל ייחוס 70 ק"ג). אימוני כוח מעניקים ניקוד בנפח ק"ג (`סטים × חזרות × משקל`). שתי היחידות אינן בנות השוואה, ודבר זה מקובל לפי התכנון.
   - **מבנה הפרויקט:** העץ ב-§12.
   - **מגבלות ידועות** (§1, §7): רענון עמוד מנתק את המשתמש מהמערכת. אין איפוס סיסמה, דוא"ל או העלאת קבצים.
   - **מסמכי פרויקט:** קישורים ל-`SPEC.md`, `project.md`, `AI-LOG.md` ו-`TESTS-LOG.md`.

**המשימה הושלמה כאשר**
- [ ] שלושת הפריטים ש-§12 דורש נוכחים: פקודות התקנה (`npm install`, `npm start`, `npm run test`), תפקידים ופרטי התחברות ברירת מחדל, וההערה על ציון המאמץ.
- [ ] כל סעיף שתלוי בעבודה מאוחרת יותר מסומן כ-`TODO (Task 13.5)`.

### משימה 0.2: יצירת `AI-LOG.md`

**קבצים:** `AI-LOG.md` (חדש) · **מפרט:** §1 (הקדמה), §12

**צעדים**
1. צור את `AI-LOG.md` עם כותרת קצרה: שם הפרויקט, המטרה (§12: "הנחיות (prompts) שבהן נעשה שימוש והחלטות שה-AI קיבל"), וכלי ומודלי ה-AI שהיו בשימוש.
2. הוסף סעיף **Prompt Log** עם רשומה אחת לכל הנחיה:
   ```markdown
   ### P-001 · 2026-10-06 · Planning
   - **Prompt:** (מילה במילה, או סיכום נאמן עבור הנחיה ארוכה מאוד)
   - **Result:** מה נוצר או שונה
   - **Files:** project.md
   - **Decisions:** D-01, D-02
   - **Review:** התקבל כמו שהוא / שונה ידנית (מה ולמה)
   ```
3. הוסף סעיף **Decision Log** כטבלה: `| ID | Date | Task | Question / spec gap | Decision | Spec ref |`.
4. רשום את הרשומות הראשונות: `P-001` (ההנחיה שייצרה את `project.md`), `D-01` ו-`D-02`.

**המשימה הושלמה כאשר**
- [ ] שני הסעיפים קיימים עם התבניות שצוינו מעלה.
- [ ] `P-001`, `D-01` ו-`D-02` מתועדים.

### משימה 0.3: יצירת `TESTS-LOG.md`

**קבצים:** `TESTS-LOG.md` (חדש) · **מפרט:** §12, §14

**צעדים**
1. צור את `TESTS-LOG.md` עם כותרת שמצהירה על מטרתו (§12: "פלט npm run test + תוצאות רשימת הבדיקות הידנית").
2. הוסף סעיף **Automated Test Runs** עם רשומה אחת לכל שער שלב (stage gate):
   ```markdown
   ### Run 01 · <date> · Stage 1 gate
   - **Command:** `cd server && npm run test`
   - **Result:** tests <n> · pass <n> · fail 0 · exit code 0
   - **Summary output:** (הדבק את שורות הסיכום הסוגרות המודפסות מ-node:test)
   ```
3. הוסף סעיף **Manual Acceptance Checklist (§14)**: שורת טבלה אחת לכל אחת מ-37 הבדיקות ב-[נספח](#appendix-acceptance-checklist-map-14), תוך שימוש במזהים שלהן (IDs). עמודות: `| ID | Check | Result | Date | Evidence / notes |`. הגדר את כל התוצאות ל-`Pending`.
4. הוסף סעיף **Defects** עבור תקלות שנמצאו במהלך הבדיקות הידניות: `| ID | Found in task | Description | Fixed in task |`.

**המשימה הושלמה כאשר**
- [ ] כל 37 הבדיקות רשומות עם ה-IDs שלהן וסטטוס `Pending`.
- [ ] תבנית ההרצה האוטומטית מוכנה עבור הרצה מספר 01 (Task 1.6).

### משימה 0.4: השלמת שלב 0 (יצירת ענף ו-commit בסיסי)

**קבצים:** אין (רק git) · **מפרט:** אין

**צעדים**
1. צור את ענף העבודה: `git checkout -b project-2`.
2. סקור את ארבעת המסמכים (`project.md`, `README.md`, `AI-LOG.md`, `TESTS-LOG.md`) עבור שגיאות כתיב וקישורים שבורים.
3. בצע להם commit ביחד עם ה-`SPEC.md` שלא השתנה:
   ```bash
   git add SPEC.md project.md README.md AI-LOG.md TESTS-LOG.md
   git commit -m "[0] Add spec, project plan and tracking files"
   ```

**המשימה הושלמה כאשר**
- [ ] הענף `project-2` קיים ועץ העבודה (working tree) נקי.

**שער שלב 0:** שלושת קבצי המעקב קיימים ומגובים (committed). מעתה והלאה כל משימה מעדכנת את `AI-LOG.md`, וכל שער שלב מעדכן את `TESTS-LOG.md`.

---

## שלב 1: שלד האפליקציה וסביבת בדיקות (Scaffolding & Test Harness)

**מטרה:** שלד מהלך (walking skeleton). ה-Express מגיש את הלקוח ב-`http://localhost:3000`, ו-`npm run test` מריץ בדיקת עשן מבודדת, ירוקה (תקינה).

### משימה 1.1: יצירת מבנה התיקיות

**קבצים:** ספריות בלבד · **מפרט:** §12

**צעדים**
1. צור את הספריות המפורטות ב-§12:
   ```text
   client/
   server/db/   server/models/   server/utils/   server/routes/   server/tests/
   server/middlewares/auth/   server/middlewares/roles/
   server/middlewares/ownership/   server/middlewares/validation/
   ```
2. כל קובץ ייווצר בהמשך על ידי המשימה שבבעלותה הוא נמצא. לעולם אל תוסיף קבצים מחוץ לעץ ב-§12: לא מודולי עזר נוספים, וללא קובץ `.env` (`dotenv` אינו מופיע ברשימת הטכנולוגיות המותרות).

**שים לב:** Git לא עוקב אחרי ספריות ריקות. כל תיקייה תיכנס למאגר (repository) יחד עם הקובץ הראשון שלה.

**המשימה הושלמה כאשר**
- [ ] עץ הספריות תואם ל-§12.

### משימה 1.2: אתחול `server/package.json`

**קבצים:** `server/package.json`, `server/package-lock.json` (חדש) · **מפרט:** §10, §12

**צעדים**
1. הרץ `npm init -y` בתוך התיקייה `server/`.
2. ערוך את `package.json`: הגדר `"main": "server.js"`, הוסף `"engines": { "node": ">=20" }`, ושמור אך ורק את הסקריפטים הבאים:
   ```json
   "scripts": {
     "start": "node server.js",
     "test": "node --test tests/system.test.js"
   }
   ```
3. התקן את ארבעת התלויות (dependencies) המותרות: `npm install express cors bcryptjs jsonwebtoken`. אל תוסיף תלויות פיתוח (dev dependencies): לא nodemon, לא ספריות בדיקה.
4. ודא כי קיימת התעלמות מספריית `node_modules/` (קובץ ה-`.gitignore` בשורש המאגר כבר מכיל אותה) ושהקובץ `package-lock.json` ייכנס ל-commit.

**שים לב:** `npm install express` מתקין את Express בגרסה 5. ב-Express 5, משתנה ה-`req.body` הוא `undefined` כאשר הבקשה לא מכילה גוף JSON, ולכן קרא תמיד `req.body ?? {}`.

**המשימה הושלמה כאשר**
- [ ] ל-`package.json` יש בדיוק את שני הסקריפטים וארבעת התלויות.
- [ ] הקובץ `package-lock.json` קיים.

### משימה 1.3: יצירת שלד ה-`server.js`

**קבצים:** `server/server.js` (חדש) · **מפרט:** §6, §10

**צעדים**
1. צור את האפליקציה והוסף את ה-middlewares הגלובליים בסדר הזה: `cors()`, `express.json()`, `express.static(path.join(__dirname, '..', 'client'))`.
2. הוסף סימון מוער (commented placeholder) בו שלב 7 יחבר את הראוטרים.
3. לאחר הסימון הנ"ל, הוסף: `app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))`.
4. הוסף middleware אחרון לטיפול בשגיאות `(err, req, res, next)`. בקשות JSON פגומות (`err.type === 'entity.parse.failed'`) → יחזירו `400 { error }`. כל דבר אחר → `500 { error }` (D-04).
5. ייצא את האפליקציה והאזן רק כאשר הקובץ מורץ ישירות:
   ```js
   module.exports = { app };

   if (require.main === module) {
     app.listen(3000, () => console.log('Server running at http://localhost:3000'));
   }
   ```
6. שמור על `server.js` עבור חיווט (wiring) בלבד. הלוגיקה העסקית צריכה להימצא במקום אחר (§10).

**המשימה הושלמה כאשר**
- [ ] פקודת `npm start` מגישה את צד הלקוח תחת `http://localhost:3000`.
- [ ] `require('./server.js')` אינו פותח פורט.
- [ ] נתיב `/api/...` בלתי מוכר מחזיר `404 { error }`, ו-JSON פגום מחזיר `400 { error }`.

### משימה 1.4: יצירת תבניות ראשוניות ללקוח

**קבצים:** `client/index.html`, `client/style.css`, `client/script.js` (חדש) · **מפרט:** §9, §10, §11

**צעדים**
1. `index.html`: תבנית HTML5 כללית (boilerplate) עם תגיות: `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<link rel="stylesheet" href="style.css">`, `<script src="script.js" defer></script>`, וסמני (landmarks) `<header>` ו-`<main>` ריקים.
2. `style.css`: איפוס (reset) קטן ומחלקת עזר (utility) של `.hidden { display: none; }` (§9).
3. `script.js`: שלושה אזורים מוערים, בסדר זה:
   ```js
   // 1) Constants and pure logic: no DOM access, tested from Node

   // 2) DOM layer: runs in the browser only
   if (typeof document !== 'undefined') {
     // event listeners, rendering, fetch calls
   }

   // 3) Node export for the test suite
   if (typeof module !== 'undefined') module.exports = { /* pure functions and constants */ };
   ```

**המשימה הושלמה כאשר**
- [ ] הפקודה `node -e "require('./client/script.js')"`, כשהיא מורצת בשורש הפרויקט, מסתיימת ללא שגיאות.
- [ ] העמוד נטען ב-`http://localhost:3000` ללא שגיאות בקונסולה.

### משימה 1.5: יצירת קבצי מסד הנתונים הראשוניים (Seed)

**קבצים:** `server/db/options.json`, `server/db/trainings.json`, `server/db/users.json` (חדש) · **מפרט:** §2.1, §3.2, §3.5, §5

**צעדים**
1. `options.json`: בדיוק באלמנטים הבאים `{ "muscleGroups": ["chest", "back", "legs", "shoulders", "arms", "core"] }`.
2. `trainings.json`: לפחות 3 פריטי אימון כוח (Power) ופריט אירובי אחד לכל פעילות (running, walking, cycling, elliptical, rowing, other), כלומר לפחות 9 פריטים בסך הכל עם מזהים (ids) עוקבים. פריטי כוח יקבלו `muscleGroup` מהרשימה, `activity: null` ו-`includeCalories: false`. פריטים אירוביים יקבלו `activity`, `muscleGroup: null` ודגל `includeCalories`. הפעל את הדגל בפריט אירובי אחד לפחות, כדי שאפשרות הקלוריות תופיע כבר בהפעלה הראשונה (§3.5). שמות צריכים להיות ייחודיים עבור כל סוג. דוגמאות:
   ```json
   { "id": 1, "type": "Power", "name": "Bench Press", "activity": null, "muscleGroup": "chest", "includeCalories": false }
   { "id": 4, "type": "Aerobic", "name": "Treadmill Run", "activity": "running", "muscleGroup": null, "includeCalories": true }
   ```
3. `users.json`: שני המשתמשים הראשוניים מסעיף §2.1 עם סיסמאות **בטקסט פשוט (plaintext)**, שיוצפנו בפעמים הראשונות (§5, משימה 4.2). דוגמאות:
   ```json
   { "id": 1, "name": "Hilli Schlesinger", "tel": "050-1234567", "role": "superadmin", "password": "1234", "sessions": [] }
   { "id": 2, "name": "Staff Admin", "tel": "052-7654321", "role": "admin", "password": "admin123", "sessions": [] }
   ```
   אל תכניס משתמשים רגילים בהתחלה. הם ייווצרו בעזרת הרישום הרגיל (§2.1).
4. אופציונלי: הוסף לשני המשתמשים הללו כמה אימונים קודמים (בדויים) כדי שלוח הבקרה לא יהיה ריק לחלוטין בפעם הראשונה. השתמש במבנה אימון (session) מסעיף §8, כולל השדה `includeCalories`. בדיקות (Tests) חייבות להיות לא תלויות באימונים אלה בשום שלב.

**המשימה הושלמה כאשר**
- [ ] כל שלושת הקבצים מעובדים (parsed) ל-JSON חוקי ותקין.
- [ ] לקטלוג יש לפחות 3 פריטי כוח ופריט אירובי אחד לכל פעילות, ורשימת האפשרויות כוללת בדיוק שש.
- [ ] מספרי הטלפון של המשתמשים ההתחלתיים מתאימים לדפוס ה-Regex: `/^05\d-?\d{7}$/`.

### משימה 1.6: בניית סביבת הבדיקות

**קבצים:** `server/tests/system.test.js` (חדש) · **מפרט:** §13

**צעדים**
1. יבא את `describe`, `it`, `before` ו-`after` מ-`node:test`, ואת `assert` מ-`node:assert/strict`, יחד עם `fs/promises`, `os` ו-`path`.
2. בפונקציית `before()`:
   1. צור תיקייה זמנית באמצעות `fs.mkdtemp(path.join(os.tmpdir(), 'fitness-'))` (D-03).
   2. העתק אליה כל קובץ מסוג `db/*.json`.
   3. הגדר את משתנה הסביבה `process.env.DB_DIR` להצביע אל התיקייה הזמנית, ואת `process.env.JWT_SECRET` לערך כלשהו שמיועד לבדיקות.
   4. רק לאחר מכן בצע `require('../server.js')`. הקריאה לפקודה `require` חייבת להתרחש בתוך ה-`before()`, אחרי הגדרת משתני הסביבה.
   5. הפעל באמצעות `server = app.listen(0)` ובנה את ה-`baseUrl` בעזרת הערך של `server.address().port`.
3. הוסף פונקציות עזר (helpers) שהשלבים הבאים ישתמשו בהן שוב:
   - `api(method, path, { token, body })`: קורא ל-`fetch` הגלובלי, שולח ומפענח JSON, ומחזיר `{ status, body }` (`body` הוא `null` עבור `204`).
   - `assertNoPassword(value)`: עוברת רקורסיבית על כל ערך JSON ונכשלת במידה ומופיע מפתח `password` בשלב כלשהו (§13).
4. בתוך ה-`after()`: סגור את השרת, ואז הרץ מחיקה לתיקייה הזמנית על ידי `fs.rm(tmpDir, { recursive: true, force: true })`.
5. צור את שמונת הקבוצות (describe blocks) בהתאם לסעיף §13, בסדר הבא: Models, Calories, DB utils, Validation, Middlewares, API routes, RBAC, Client logic.
6. הוסף בדיקות עשן תחת "API routes": קריאת `GET /` מחזירה `200` יחד עם HTML, וקריאת `GET /api/does-not-exist` מחזירה `404 { error }`.

**שים לב:** אם התהליך של הבדיקות "נתקע" (hangs) אחרי הבדיקה האחרונה, השתמש ב-`server.closeAllConnections()` לפני הקריאה ל-`server.close()`. פקודת `fetch` משאירה לעתים חיבורים פתוחים (alive).

**המשימה הושלמה כאשר**
- [ ] פקודת `npm run test` יוצאת עם קוד 0.
- [ ] לאחר הרצה כזו, הפקודה `git status` מראה שאין שום שינוי בתיקיית `server/db/`, והתיקייה הזמנית (tmp folder) נעלמה במלואה.

**שער שלב 1:** פקודת `npm start` מגישה את הדף הבסיסי ו-`npm run test` תקין ומסתיים בטוב (ירוק). רשום (Log) את הריצה תחת שם הרשומה *Run 01* בתוך `TESTS-LOG.md`.

---

## שלב 2: מנוע קלוריות (Calorie Engine)

**מטרה:** פונקציות טהורות לחישוב קלוריות בקובץ `server/utils/calories.js` המבוססות בדיוק על טבלת הייחוס בסעיף §3.4 ומגובות בבדיקות יחידה מלאות. הן חסרות תלויות בקוד אחר, מה שהופך אותן לנקודת ההתחלה הטובה ביותר לכתיבת קוד.

### משימה 2.1: קבועים ופונקציות עזר להמרה

**קבצים:** `server/utils/calories.js` (חדש) · **מפרט:** §3.3, §3.4

**צעדים**
1. ייצא את `REFERENCE_BODY_WEIGHT_KG = 70`.
2. כתוב וייצא פונקציות עזר קטנות, כשכל אחת כוללת הערה המציגה את נוסחתה:
   - `toMetersPerMinute(speedKmh)` → `speedKmh × 1000 / 60` (המסומן כאות `S`).
   - `vo2ToKcal(vo2, duration)` → `duration × (vo2 × BW / 1000) × 5`.
   - `roundToOneDecimal(x)` → `Math.round(x * 10) / 10`.

**בדיקות (Calories):** יש לבדוק כל פונקציית עזר למול ערך ידוע מראש, למשל: `toMetersPerMinute(6)` מחזיר `100` וגם `roundToOneDecimal(165.666)` מחזיר `165.7`.

**המשימה הושלמה כאשר**
- [ ] הקבוע וכל פונקציות העזר מיוצאות (exported) ונבדקות.

### משימה 2.2: פונקציות קלוריות לפי פעילות

**קבצים:** `server/utils/calories.js` (עריכה) · **מפרט:** §3.4

**צעדים**
1. יישם את שש הפונקציות מסעיף §3.4. כל אחת מקבלת אובייקט בודד (ארגומנט) ומחזירה קלוריות המעוגלות עשרונית לנקודה אחת: `calcWalkingKcal`, `calcRunningKcal`, `calcCyclingKcal`, `calcEllipticalKcal`, `calcRowingKcal` ו-`calcGenericKcal`.
2. פעל בהתאם לסמלים ב-§3.4: `S` מייצג מהירות ב-m/min, `G` מייצג שיפוע/100, `R` הוא רמת ההתנגדות, ו-`BW` נשאר על 70 תמיד. פרמטר ה-`difficulty` לא משפיע על התוצאה לעולם.
3. טיפ חשוב: כתוב את הבדיקות מול טבלת הייחוס לפני הכתיבה עצמה.

**שים לב:** כוח מדומה ברכיבה עליות נוטה להשתמש במהירות השטוחה ב-**km/h** (`W = 10·R + 5·speed`), ולא באות `S`. כאשר נעשה שימוש באות `S`, הרכיבה המדומה (reference ride) תחושב כ-2179.5 קק"ל במקום 276.0.

**בדיקות (Calories):** סעיף `it` יחיד לכל שורה בטבלה מסעיף §3.4 (7 שורות), שניתן לאשר מול ערך `assert.equal` מדויק. ודא גם כי כל תוצאה כוללת למרב ספרה עשרונית אחת: `assert.equal(x, Math.round(x * 10) / 10)`.

**המשימה הושלמה כאשר**
- [ ] כל 7 הערכי רפרנס (reference values) תואמים בצורה מוחלטת.

### משימה 2.3: פונקציית הניתוב (router) - `calculateAerobicKcal`

**קבצים:** `server/utils/calories.js` (עריכה) · **מפרט:** §3.4

**צעדים**
1. `calculateAerobicKcal(session)` תבחר בפונקציה הרלוונטית בעזרת `session.activity`. ערכים זרים או פעילות חסרה יחזרו כברירת מחדל אל `calcGenericKcal`.
2. ייצא אותה ביחד עם שאר הפונקציות והקבועים של המודול.

**בדיקות (Calories):** יש לוודא כי כל אחת מתוך 6 הפעילויות מובילה ישירות לפונקציה הרלוונטית, בנוסף פעילות מסוג `activity: 'swimming'` תפעיל במדויק את הנוסחה הגנרית.

**המשימה הושלמה כאשר**
- [ ] הקבוצה של ה-Calories בודקת כל דבר שמיוצא תחת `calories.js`.

**שער שלב 2:** קבוצת הקלוריות (Calories group) מראה תוצאה תקינה (ירוקה). תעד את ההרצה.

---

## שלב 3: מודלי הדומיין (Domain Models)

**מטרה:** היררכיית המחלקות שבסעיף §3.1, כולל היבטי סריאליזציה (`toJSON`, `toDB`) ושחזור מ-JSON (פונקציית `fromJSON`), תוך בדיקות יחידה מלאות והדוקות.

### משימה 3.1: `Training` (פריט קטלוג)

**קבצים:** `server/models/Training.js` (חדש) · **מפרט:** §3.2, §3.5

**צעדים**
1. הצהר על `static idCounter = 1`.
2. כתוב בנאי `constructor({ id, type, name, activity = null, muscleGroup = null, includeCalories = false })`. השתמש ב-`id` שניתן, וקח אחד חדש מהמונה (counter) רק כאשר לא הועבר שום `id`: במקרה כזה השתמש ב-`this.id = id ?? Training.idCounter++`.
3. הגדר את השדות: `id`, `type` (`'Power'` או `'Aerobic'`), `name`, `activity` (עבור אירובי בלבד, אחרת `null`), `muscleGroup` (עבור כוח בלבד, אחרת `null`) ו-`includeCalories` (רק פריטים אירוביים יכולים לקבל `true`). רשומות ישנות ללא `includeCalories` נטענות כ-`false` בזכות ערך ברירת המחדל.
4. `calculateEffortScore()`: העתק מילה במילה את גוף הפונקציה הזורקת שגיאה מסעיף §3.2, כולל ההערה שבה.
5. הפונקציה `toJSON()` מחזירה `{ id, type, name, activity, muscleGroup, includeCalories }`. הפונקציה הסטטית `static fromJSON(obj)` מחזירה `new Training(obj)`.
6. `module.exports = { Training }`.

**בדיקות (Models):** יצירת `Training` ללא `id` מעלה את `Training.idCounter`, ויצירת אחד עם `id` לא עושה זאת. ערך ברירת המחדל של `includeCalories` הוא `false`. `calculateEffortScore()` זורקת שגיאה עם הודעה שמכילה את המילים `must be overridden` (`assert.throws(fn, /must be overridden/)`). פונקציות `toJSON` ו-`fromJSON` משלימות מסלול הלוך-חזור (round-trip).

**המשימה הושלמה כאשר**
- [ ] לכל שיטה (method) של `Training` יש בדיקה.

### משימה 3.2: מחלקת `BaseSession`

**קבצים:** `server/models/Session.js` (חדש) · **מפרט:** §3.2, §3.5, §8

**צעדים**
1. הצהר על `class BaseSession extends Training` עם קאונטר משלו `static idCounter = 1` עבור שדה `sessionId`.
2. בתוך הבנאי (constructor), קרא ל-`super({ id: trainingId, type, name, activity, includeCalories })` בעזרת המזהה של **פריט הקטלוג**, כך ש-`Training.idCounter` נשאר ללא שינוי. האימון שומר עותק משלו של אפשרות הקטלוג `includeCalories` (§3.5). לאחר מכן הגדר `this.sessionId = sessionId ?? BaseSession.idCounter++` וכן `this.date = date`.
3. `calculateEffortScore()` נשארת אבסטרקטית ב-`BaseSession`: המחלקה אינה מגדירה אותה, ולכן היא יורשת את הגרסה של `Training`, שזורקת את השגיאה `calculateEffortScore() must be overridden in BaseSession`. מכיוון שקריאה למתודה על מופע של `BaseSession` עצמו נכשלת, כל אחת מהמחלקות `AerobicSession` ו-`PowerSession` חייבת לדרוס (override) אותה עם חישוב אמיתי משלה (משימה 3.3).
4. הפונקציה `toJSON()` מחזירה `{ sessionId, trainingId: this.id, type, name, activity, includeCalories, date }`. ה-`id` שהורש מסריאליזציה תמיד בתור `trainingId`, ולעולם לא כ-`id`.
5. הפונקציה `static fromJSON(obj)` בוחרת את תת-המחלקה (subclass) לפי השדה `obj.type`: כאשר הוא `'Aerobic'` מוחזר `new AerobicSession(obj)`, כאשר הוא `'Power'` מוחזר `new PowerSession(obj)`, וכל דבר אחר זורק שגיאה.

**שים לב**
- השדה `trainingId` הוא דרוש (required). בלעדיו, הקריאה ל-`super()` לוקחת מזהה קטלוג חדש בשקט מתוך `Training.idCounter`.
- בנה את תתי-המחלקות (subclasses) ישירות בתוך `BaseSession.fromJSON`. אם אי פעם יחסר באחת מהן פונקציית `fromJSON` משלה, קריאה ל-`AerobicSession.fromJSON` תריץ שוב את הפונקציה המורשת `BaseSession.fromJSON`, מה שייצור לולאה אין-סופית.

**בדיקות (Models):** קריאה ל-`calculateEffortScore()` על מופע של `BaseSession` זורקת `must be overridden`. יצירת אימון מעלה את המונה `BaseSession.idCounter` ומשאירה את `Training.idCounter` ללא שינוי, וה-`trainingId` של האימון שווה למזהה בקטלוג. האימון שומר את ערך ה-`includeCalories` שאיתו נוצר.

**המשימה הושלמה כאשר**
- [ ] מוכח כי מזהי אימון (Session ids) ומזהי קטלוג אינם תלויים זה בזה.

### משימה 3.3: `AerobicSession` ו-`PowerSession`

**קבצים:** `server/models/Session.js` (עריכה) · **מפרט:** §3.2, §3.3, §3.5, §8

**צעדים**
1. מחלקת `AerobicSession extends BaseSession` מוסיפה `duration`, `speed`, `difficulty`, `incline` ו-`resistance`. כל אחד משני האחרונים שהפעילות אינה דורשת יוגדר כ-`null`: ריצה והליכה משתמשות ב-`incline`, רכיבה, אליפטיקל וחתירה משתמשות ב-`resistance`, ו-`other` לא משתמשת באף אחד מהם.
2. `AerobicSession.calculateEffortScore()` מחזיר את `calculateAerobicKcal(this)` מתוך `utils/calories.js`.
3. מחלקת `PowerSession extends BaseSession` מוסיפה `muscleGroup`, `reps`, `sets` ו-`weight`. הערך של `muscleGroup` ממולא מראש על ידי פריט הקטלוג בעת יצירת האימון וניתן לשינוי.
4. `PowerSession.calculateEffortScore()` מחזיר `sets * reps * weight`, כאשר התוצאה מעוגלת בעזרת `Math.round(x * 10) / 10`. משקלים כגון 22.5 ק"ג עלולים להשאיר שגיאות עיגול נקודה צפה (floating-point noise).
5. כל תת-מחלקה מקבלת `toJSON()`, שמחזירה `{ ...super.toJSON(), <own fields>, effortScore: this.calculateEffortScore() }` (לפי החלטה D-07), ופונקציית `static fromJSON(obj)` משלה.
6. הוסף את `calories` (§3.5): `AerobicSession.toJSON()` מוסיפה `calories: this.includeCalories ? calculateAerobicKcal(this) : null`. `PowerSession.toJSON()` מוסיפה `calories: null`, כי תרגילי כוח אינם יכולים להשתמש באפשרות.
7. `module.exports = { BaseSession, AerobicSession, PowerSession }`.

**בדיקות (Models):** הפונקציה `BaseSession.fromJSON` מחזירה את תת-המחלקה הנכונה עבור כל `type` (בדוק בעזרת `instanceof`). ציון המאמץ ב-`PowerSession` שווה ל-`sets * reps * weight`, לדוגמה 3 × 10 × 22.5 = `675`. הציון ב-`AerobicSession` תואם לפעילות: רפרנס הריצה מניב `257.8` ורכיבה מניבה `276`. קוד ה-JSON של האימון יכיל `trainingId`, `effortScore` ו-`calories`, ובלי `id`. כאשר `includeCalories: true`, ה-`calories` של `AerobicSession` שווה לקלוריות שלו (רפרנס הריצה → `257.8`); כאשר הוא `false` הערך הוא `null`, וב-`PowerSession` הערך תמיד `calories: null`. ה-`toJSON` וה-`fromJSON` של כל תת-מחלקה נבדקים.

**המשימה הושלמה כאשר**
- [ ] שתי תתי-המחלקות דורסות את `calculateEffortScore()`, ולכל שיטה (method) יש בדיקה.

### משימה 3.4: מחלקת המשתמש `User`

**קבצים:** `server/models/User.js` (חדש) · **מפרט:** §3.2, §3.3

**צעדים**
1. הצהר על מונה `static idCounter = 1` וכתוב בנאי `constructor({ id, name, tel, role, password, sessions = [] })` עם המזהה `this.id = id ?? User.idCounter++`.
2. הפונקציה `toJSON()` תחזיר `{ id, name, tel, role, sessions }`, **ללא השדה `password`**. שימוש ב-`res.json(user)` קורא לזה באופן אוטומטי.
3. פונקציית `toDB()` מחזירה `{ ...this.toJSON(), password }`. זהו המבנה היחיד שייכתב אי פעם לקובץ `users.json`.
4. פונקציית `static fromJSON(obj)` מחזירה אובייקט `User` שהאימונים (sessions) בו שוחזרו: `(obj.sessions ?? []).map((s) => BaseSession.fromJSON(s))`.
5. `module.exports = { User }`.

**שים לב:** קרא לצורה הזו `.map((s) => BaseSession.fromJSON(s))`, ולא `.map(BaseSession.fromJSON)`. הצורה הקצרה מעבירה פנימה גם את האינדקס ואת המערך, ומאבדת את `this` בתוך הפונקציה הסטטית.

**בדיקות (Models):** מונה מזהה המשתמשים (id counter) מתקדם בעת יצירה. `JSON.stringify(user)` אינו מכיל `password`, בשעה ש-`toDB()` כן מכיל. שחזור ב-`fromJSON` מחזיר `User` שהאימונים שלו הם מופעים חוקיים של תתי-המחלקות.

**המשימה הושלמה כאשר**
- [ ] קבוצת המודלים (Models group) מכסה כל בדיקה המוזכרת בשורת המודלים ב-§13.

**שער שלב 3:** קבוצת המודלים ירוקה ותקינה. תעד את ההרצה.

---

## שלב 4: שכבת הנתונים (Persistence Layer)

**מטרה:** תספק קריאות וכתיבות בטוחות ב-`server/utils/db.js` של קבצי JSON (Crash-safe), שחזור מופעי מחלקות, איפוס מוני ID והגדרת סיסמאות Seed ראשוניות (D-05).

### משימה 4.1: `readDB` ו-`writeDB`

**קבצים:** `server/utils/db.js` (חדש) · **מפרט:** §5, §10

**צעדים**
1. אתר את התיקייה **בתוך כל קריאה לפונקציה** באמצעות `process.env.DB_DIR || path.join(__dirname, '..', 'db')`. לעולם אל תשמור את הנתיב כמשתנה במטמון בזמן טעינת המודול; הבדיקות תלויות בכך.
2. `readDB(file)` קורא את הקובץ באמצעות `fs/promises` ומעבד עם `JSON.parse`.
3. `writeDB(file, data)` כותב מחרוזת באמצעות `JSON.stringify(data, null, 2)` אל קובץ `<file>.tmp`, ואז משתמש ב-`fs.rename()` כדי להחליף את הקובץ המקורי. כל כתיבה באפליקציה עוברת דרך פונקציית עזר זו.

**בדיקות (DB utils):** קריאה וכתיבה של קובץ זמני (לדוגמה `roundtrip.json`) מבטיחה חזרה של נתונים זהים (deep-equal data), ולא נשאר קובץ `.tmp` בתיקייה. החלפת משתנה הסביבה `DB_DIR` בין שתי תיקיות משנה את המיקום בו הקריאות מתבצעות.

**המשימה הושלמה כאשר**
- [ ] שתי הפונקציות מיוצאות ונבדקות.

### משימה 4.2: פונקציית הגדרת סיסמאות Seed (`bootstrapSeedPasswords`)

**קבצים:** `server/utils/db.js` (עריכה) · **מפרט:** §5, §6

**צעדים**
1. קרא את `users.json`, והצפן כל `password` שאינה מתחילה ב-`$2` באמצעות `bcrypt.hash(password, 10)`.
2. כתוב את הקובץ בחזרה באמצעות `writeDB` רק אם חל בו שינוי כלשהו. החזר את מספר הסיסמאות שהוצפנו.

**בדיקות (DB utils):** בתוך התיקייה הזמנית השנייה, השתמש בנתונים לדוגמה הכוללים סיסמה אחת בטקסט חופשי (plaintext) וסיסמה מוצפנת אחת. לאחר ההרצה, סיסמת הטקסט תהפוך להאש (hash) של bcrypt (בדיקת התאמה באמצעות `bcrypt.compare` מצליחה) וההאש שהיה קיים קודם נותר ללא שינוי.

**שים לב:** בסיום כל בדיקת נתונים, החזר את `process.env.DB_DIR` להצביע חזרה על התיקייה הזמנית הראשית. שאר קבוצות הבדיקה ימשיכו להשתמש בה.

**המשימה הושלמה כאשר**
- [ ] סיסמאות Seed בטקסט פשוט הופכות להאשים, והאשים קיימים לעולם לא מוצפנים שנית.

### משימה 4.3: `loadAll`: שחזור, אתחול מונים ושמירה לזיכרון

**קבצים:** `server/utils/db.js` (עריכה) · **מפרט:** §3.3, §5

**צעדים**
1. `loadAll()` קורא את שלושת הקבצים ומשחזר אותם: המשתמשים דרך `User.fromJSON`, והתרגילים דרך `Training.fromJSON`. האפשרויות נשארות במבנה רגיל כ-`{ muscleGroups: [...] }`.
2. בצע אתחול (reseed) לכל מונה אל `max + 1`, או `1` כאשר אין רשומות כלל (§3.3):
   - `User.idCounter` יעודכן לפי מזהי (IDs) המשתמשים.
   - `Training.idCounter` מעודכן לפי מזהי הקטלוג וכל `trainingId` מכל האימונים השמורים (D-06).
   - `BaseSession.idCounter` יעודכן לפי כל מזהה ה-`sessionId` המופיע אצל המשתמשים השונים.
3. שמור את המצב כמשתני מודול (module-level state) והחזר אותם. תן לנתיבי השרת גישה אליהם באמצעות אקססור קטן, כגון `getState()`. כתיבת פונקציות שמירה (save helpers) רזות הינה אופציונלית, כמו `saveUsers()` שקוראת ל-`writeDB('users.json', users.map((u) => u.toDB()))`. ייצא ובדוק כל פונקציית עזר שהוספת.

**בדיקות (DB utils):** לאחר הפעלת `loadAll()`, כל רשומה היא מופע מחלקה מאומת (בדוק עם `instanceof User`, `Training`, וכו'), וכל מונה (counter) שווה ל-`max + 1`. אם המערכים ריקים (בתיקיית הניסוי), המונים שווים ל-`1`.

**המשימה הושלמה כאשר**
- [ ] לא נותרו אובייקטים פשוטים (plain objects) בזיכרון לאחר פעולת הטעינה.

### משימה 4.4: חיווט תהליך ההפעלה (Startup)

**קבצים:** `server/server.js`, `server/tests/system.test.js` (עריכה) · **מפרט:** §5, §10, §13

**צעדים**
1. בתוך `server.js`, בחלק של התנאי `require.main === module`, קרא לפקודה `await bootstrapSeedPasswords()`, לאחריה `await loadAll()`, ולבסוף הרץ `app.listen(3000)`.
2. בבדיקת `before()`, עשה את אותן שתי קריאות בדיוק לאחר ה-`require` ל-`server.js` ולפני שמפעילים `app.listen(0)`.
3. הפעל `npm start` פעם אחת. כעת הקובץ `server/db/users.json` אמור להכיל סיסמאות מחוששות (bcrypt). בצע הפעלה מחדש כדי לאשר שאף ערך לא חושש שנית. שינוי כזה על קובץ בסיס מצופה בשלב ההפעלה (§5); משימה 13.6 דואגת לאפס חזרה את הקבצים לפני ההפצה.

**המשימה הושלמה כאשר**
- [ ] תהליכי הבדיקה והשרת מבצעים אתחול והצפנה לפני הגשת בקשות.
- [ ] ההאשים המופיעים ב-`users.json` מתועדים בקובץ `TESTS-LOG.md` כהוכחה עבור בדיקת ההגדרות AUTH-03.

**שער שלב 4:** קבוצת המסד נתונים (DB utils group) ירוקה, ופקודת `npm start` מדליקה את השרת, מצפינה את סיסמאות ההתחלה, ומציגה את הדף. תעד את הריצה.

---

## שלב 5: אימות נתונים (Input Validation)

**מטרה:** הקובץ `server/middlewares/validation/validate.js` אוכף כל חוק המצוין ב-§4 על כל פעולת כתיבה, ויחזיר שגיאת `400 { error }` במקרה של הפרה (החלטה D-08).

**עיצוב לשלב זה:** נשמור על כל חוק בתוך פונקציה טהורה וקצרצרה שניתן לבדוק בקלות (unit-test). כמו כן נשמור על 5 ה-middlewares רזים ככל האפשר. הם קוראים לכללים ויחזירו `400` בכשל הראשון שמתקבל. במקרה של הצלחה, הם שומרים את הנתונים ה**מנורמלים (normalized)** חזרה תחת המשתנה `req.body` (כך שמספרים יומרו נכון, מחרוזות יעברו trims, וקבוצות שרירים יעברו ל-lowercase), כדי לאפשר למטפלים (handlers) לשמור מידע נקי בלבד.

**הוספת עוזר Mock (ייעשה פעם אחת בשלב זה):** הפונקציה `runMiddleware(mw, req)` יוצרת `res` מזויף שפונקציית `status()` בו מחזירה `res`, ו-`json()` רושמת את גוף התגובה. היא מעבירה לה פונקציית בדיקה כ-`next` (spy), ממתינה ל-middleware, ומחזירה `{ nextCalled, status, body }`. נעשה בזה שימוש גם בשלב 5 וגם בשלב 6.

### משימה 5.1: קבועי חוקים ופונקציות עזר פרימיטיביות

**קבצים:** `server/middlewares/validation/validate.js` (חדש) · **מפרט:** §4

**צעדים**
1. ייצא את מערכי המונים (enums) שנמצאים בשימוש תדיר בכל מקום (צד הלקוח יעתיק אותם במשימה 9.1): מדובר ב-`ROLES`, `TYPES`, `ACTIVITIES`, `DIFFICULTIES`, ביחד עם קבוצות שרירים כמו `INCLINE_ACTIVITIES = ['running', 'walking']` ו- `RESISTANCE_ACTIVITIES = ['cycling', 'elliptical', 'rowing']`.
2. ייצא את תבניות ה-Regex הבאות: `TEL_PATTERN = /^05\d-?\d{7}$/` וכן תבנית קבוצת השרירים `MUSCLE_GROUP_PATTERN = /^[A-Za-z -]{2,30}$/`.
3. כתוב את פונקציות העזר האלו:
   - `toNumber(value)` שמחזיר מספר סופי, או `NaN` אם הקלט ריק או אינו מספר.
   - `isValidDate(str)` דורש התאמה מוחלטת ל-`YYYY-MM-DD`, שיהיה תאריך חוקי של לוח השנה, ושהוא לא מאוחר מתאריך השרת המקומי של היום (D-15).
   - חוקי טווחים (Range) ושלמים (integer).

**שים לב:** הערכים `Number('')`, `Number(' ')` ו-`Number(null)` מחזירים תמיד `0`, ולכן שדה שמושאר ריק עלול לעבור בטעות בתור אפס. יש להתייחס אליו ואל משתנה `missing` קודם כל בתור `NaN` לפני המרה סופית.

**בדיקות (Validation):** ודא המרות: `toNumber('12')` ← מחזיר `12`. וגם `toNumber('abc')`, `toNumber('')` או `toNumber(null)` ← מחזירים `NaN`. `isValidDate` תאשר תאריך מהעבר, ותדחה תאריך מהעתיד ואת הנתונים `2026-02-30` ואת הצורה `06/10/2026`.

**המשימה הושלמה כאשר**
- [ ] הקבועים ופונקציות העזר מיוצאים ונבדקים.

### משימה 5.2: `validateRegister` ו-`validateCreateUser`

**קבצים:** `server/middlewares/validation/validate.js` (עריכה) · **מפרט:** §4, §8

**צעדים**
1. כללי משתמש שיתופיים (Shared): השדה `name` כצורת מחרוזת שעברה גיזום רווחים (trim) באורך של 2–50 תווים. ה-`tel` שמתאים ל-`TEL_PATTERN`. ה-`password` שמחייבת מחרוזת עם לפחות 4 תווים.
2. פונקציית `validateRegister` (אימות הרשמה) חלה על הכללים הרלוונטיים ומתעלמת משדה `role` כלשהו הנמצא בגוף הבקשה (החלטה D-09).
3. פונקציית `validateCreateUser` מחילה את הכללים אך מחייבת בנוסף שהמשתנה `role` יהיה זהה ל-`'user'` או `'admin'`, כך שבקשה ליצור `role: 'superadmin'` תחזיר מיד שגיאת `400` (§8). הכלל המאפשר לאדמין בלבד ליצור משתמש חדש הוא סוג של הרשאת גישה, ויעבור אכיפה בתוך סעיף הניתוב עצמו (משימה 7.4, D-08).
4. ייחוד השם (Name uniqueness) שמחזיר קוד שגיאה `409` ייאכף גם הוא בסעיף ניתוב ההרשאות (D-08).

**בדיקות (Validation):** בדיקה שעוברת בהצלחה וכן מקרה מכשיל (failing case) לכל אחד מהשדות:
- עבור השם: `name: 'Al'` מצליח; `'A'` ולצד זאת שם באורך 51 תווים - נכשלים.
- עברו הטלפון: `050-1234567` וגם `0501234567` עובדים היטב; `0401234567` ו-`050-123456` יכשלו.
- לסיסמה: `'1234'` יעבור, חלופי `'123'` נכשל.
- לתפקידים: הגדרת `admin` מצליחה; לעומת `superadmin` או `boss` שנדחות.

**המשימה הושלמה כאשר**
- [ ] שני ה-middlewares קוראים בהצלחה ל-`next()` בקלט חוקי ומחזירים `400 { error }` לכל השאר.

### משימה 5.3: `validateTraining` ו-`validateMuscleGroupOption`

**קבצים:** `server/middlewares/validation/validate.js` (עריכה) · **מפרט:** §3.5, §4, §8

**צעדים**
1. בקריאת POST ל-`validateTraining`: המשתנה `type` חייב להימצא מתוך המערך `TYPES`, השדה `name` צריך לעבור גיזום (trimmed) ולהתפרש על 2–50 תווים.
   - אירובי: משתנה `activity` חייב להימצא מתוך המערך של `ACTIVITIES`, בעוד ה-`muscleGroup` מקבל ערך `null`. השדה `includeCalories` אופציונלי וברירת המחדל שלו היא `false`; אם הוא נשלח, הוא חייב להיות בוליאני של JSON (`true` או `false`).
   - כוח: המשתנה `muscleGroup` יהיה חייב להתאים ל-`MUSCLE_GROUP_PATTERN` ויישמר בקובץ כאותיות קטנות ללא רווחים (trimmed, lowercased). המשתנה `activity` יקבל ערך של `null`. השדה `includeCalories` חייב להיעדר או להיות `false` (`true` → `400`), והוא נשמר כ-`false`.
2. קריאת `validateTraining` בפעולת PUT (עבור עריכה, עת `req.params.id` נמצא בשימוש): מצא את רשומת האימון המקורית השמורה בקובץ והחזר `404` אם הוא אינו בנמצא (D-08). כל שינוי על בסיס משתנה `type` בין הבקשה לפריט השמור מהווה סתירה → ויוחזר `400`. רק אחר כך יש לאמת נתונים בשדות `name`, `activity` ו-`includeCalories` לתרגיל אירובי או `muscleGroup` לתרגיל כוח. כאשר `includeCalories` חסר בבקשת PUT, הערך השמור נשאר.
3. פונקציית `validateMuscleGroupOption`: הערך מקבל `trimmed` וחייב להתאים לתבנית של `MUSCLE_GROUP_PATTERN`; כל מה שחרג ממנו מקבל בחזרה מענה `400` עם ההודעה 'Use English letters only'. הצלחה שומרת בבטחה את הערך המבוקש לאותיות קטנות. פריט כפול (`409`) מועבר לסמכות הנתיב (D-08).

**שים לב:** האפשרויות ברשימה כברירת מחדל חייבות כולן לעמוד בסטנדרט התבנית (pattern check).

**בדיקות (Validation):** אימות רשימות `type` ו-`activity`; אורך השם בתרגילים; מקרה קריאת PUT שניגש לערוך אימון ומחליף בכוונה את סוג האימון (change type) יסתיים בשגיאת `400`. הגדרת קבוצת שריר לאימון תחת הכינוי `'Forearms'` מסתיימת כשורה ותישמר כ-`'forearms'`, זאת לעומת דחיות שיתקבלו מערכים בעייתיים כדוגמת: `'x'`, וכן `'<script>'` ואפילו שימוש בעברית `'כתפיים'`. יש לחזור ולבצע את אותה פרוצדורה לבדיקת option `value`. עבור `includeCalories`: `true` ו-`false` עוברים בפריט אירובי; `'yes'`, `1` ו-`'true'` נכשלים; `true` נכשל בפריט כוח; POST בלעדיו שומר `false`; PUT בלעדיו משאיר את הערך השמור.

**המשימה הושלמה כאשר**
- [ ] מקרי ה-muscle-group מ-§13 כוללים את הכלים `"Forearms"`, `"x"`, `"<script>"` ואף `"כתפיים"`, וגם מקרי `includeCalories` מכוסים.

### משימה 5.4: פונקציית האימות - `validateSession`

**קבצים:** `server/middlewares/validation/validate.js` (עריכה) · **מפרט:** §4, §8

**צעדים**
1. סדר את ההקשר בין הנתונים השונים לפי D-12:
   - ב-POST: הנתונים הקריטיים של פריט התרגיל (מהקטלוג) נקראים באמצעות ה-`trainingId` (חיפוש שנכשל מחזיר `400`). הנתונים של ה-`type`, `activity` ו-`includeCalories` נקראים היישר ממנו.
   - ב-PUT: מצא אימון קיים שנשמר באזור ה-`:userId` (כישלון יחזיר `404`). לאחר הגדרת אימות המקור עבור `type`, `activity` ו-`includeCalories`, יחזור ערך של `400` באם יש אי התאמה לתוכן הנשלח.
2. משתנים קבועים וכללים משותפים: `date` תקני שפורמטו הוא מן הסתם `YYYY-MM-DD` ושתאריכו הוא לעולם איננו בעתיד.
3. חוקי אירובי לפעילות:
   - זמן הפעילות `duration` נע מ-1 עד 600, `speed` במהירות של מ-0.1 ועד 15.5, בעוד השדה של קושי נכלל תחת רשימת ה-`DIFFICULTIES`.
   - פקטור השיפוע `incline` הוא טווח של 0-15 שיועד להליכה וריצה.
   - רמת התנגדות מוגדרת תחת משתנה מספר שלם משלים של מ-1 ועד 10 ותיועד למחלקות התרגילים של כלי שייט כמו cycling, elliptical וכו'.
   - שדות בלתי רלוונטיים מתאפסים כערכי `null` (D-11).
4. חוקי כוח לפעילות (D-13):
   - במצב חסר של `muscleGroup` בטופס ה-POST, לוקחים את הגדרות פריט הקטלוג שלפנינו במקום. אחר כך אפשר לבחור איזה שריר יש להזין מתוך הרשימה, או כפי שהוא מצוי בתוך ערך הפריט, או בסוף בעת קריאת ה-PUT שנדרשת לאמת בעצמה אילו ערכי שריר מותר למלא ולשמור.
   - השדות `reps` (חזרות) וכן ה-`sets` (סטים) מהווים מספרים שלמים הנעים ברף הטווח התקני שבין 1–1000.
   - ערך משקולת `weight` מותאם לטווח הכללי המותר: בין 0 ועד 500, מספר של משקל כ"0" מהווה למעשה משקל עבודה ללא משקלים.
5. כתיבה ושמירה אל ה-`req.body` עבור שדות מתאימים ולגיטימיים בלבד. קריאת בקשה תחת פקודת PUT לא עתידה לעולם לשנות את פרטי ה-`trainingId` הבסיסיים כמו: `type`, `activity`, `includeCalories`, `name` ומזהה `sessionId`.

**בדיקות (Validation):**
- כיסוי מינימלי למקרי הקצה מ-§13: אימוץ קו מהירות ממוצע כדוגמת `speed: 15.5` עובד. בדיקת גבול שמאפשרת קו של `speed: 16` תידחה. מחרוזת פשוטה כדוגמת `"12"` אושרה לרישום והתקבלה; וכל דבר זר כקלט כמו למשל `"abc"` סורב בכל מצב. שילוב שגוי של ריצה אל מול חוסר יכולת לבצע קריאת הרצת `incline` על משתנה נכשל.
- מקרי נוספים שיש להקפיד ולתחזק מראש לבדיקה: אימון רכיבת אופניים יחד עם הוספה של שילוב ערך `incline` יגרום לשגיאה בשרת; פקטור הרכיבה (resistance) בסדר גודל מופרך של `5.5` קרי ערכים עשרוניים (אשר אינם נופלים לסיווג התקני) עלול להיכשל. רישום של `reps: 0` יידחה בדיוק גם כרישום של `reps: 2.5`. לעומת זאת משקל גוף כמו `weight: 0` משתלב מצוין, בניגוד גמור לאפשרות שגיאת קו מוגזמת של משקולת כגון 501 אשר הוגבלה לסך המקסימום המותר. שדה אימון שמוכן לקלוט בקשת רישום בתאריכי העתיד יסורב להכנסת אישור תקין; וכנ"ל לגבי משתנה פריט שאיננו מוכר בלקסיקון של רכיב ה-`trainingId`. בחירת קבוצת שרירים אל מחוץ לרשימת הערכים תחזיר מובן ששגוי למערכת הבדיקה. בקשת PUT שמנסה לשנות את `includeCalories` נכשלת.
- על מנת לייצר מערכי עבודה תקינים להשוואה ובדיקה מקומית עבור שדות ה-PUT, ניתן לעשות זאת באופן מיידי על גבי זיכרון המטמון העמוס בהפעלת הקריאה להגדרת `getState()` המיידית, במקום לחכות לשלב ההמתנה הבא המופיע במשימה 7 להפעלת הקריאות השמורות אל מול המערכת של נתיבי הרשת השלמים (sessions API).

**המשימה הושלמה כאשר**
- [ ] עמידה וכיסוי מוקפד לבדיקת ההצלחה ולפחות שגיאת שורת אימות אחת עבור כל השדות שפורטו בפסקה התואמת לכללי ה-Validation שמפורטים בטבלת §4 ובשדה העמידות בבדיקות כפי שמצוינת בשורת ה-Validation מסעיף §13.

**שער שלב 5:** מסגרת הבדיקה הכוללת את קבוצת האימות (Validation group) מקבלת אישור "ירוק". רשום את פרטי הפעולה להרצה הנוכחית ותעד.

---

## שלב 6: Middlewares של אימות (Auth) וגישה

**מטרה:** פיתוח שלושת קבצי ה-middleware מ-§6, כשכל אחד מהם נבדק באמצעות מוק (mock) עבור `req`/`res`/`next`. כל קובץ יקרא לפונקציית `next()` כאשר הבקשה מורשית להמשך, ויחזיר קוד רלוונטי של `401` או `403` במידה ולא.

### משימה 6.1: `authenticateToken` ו-`signToken`

**קבצים:** `server/middlewares/auth/authenticate.js` (חדש) · **מפרט:** §6, §7

**צעדים**
1. קרא את הסוד מתוך השרת בכל הפעלה: `process.env.JWT_SECRET || '<dev-only fallback>'`, והוסף הערה המציינת כי ה-fallback המפורט נועד רק למטרות פיתוח ומעבר של בדיקות תקינות.
2. הגדרת הפונקציה `signToken(user)` שמייצרת את מבנה ה-Token, במקרה זה `jwt.sign({ userId, role, name }, secret, { expiresIn: '2h' })` לפי החלטה D-16.
3. פיתוח ה-middleware עבור פונקציית `authenticateToken` שמצפה לבקשה לקבלת מחרוזת: `Authorization: Bearer <token>`. במידה ומבנה ההודעה פגום או חסר, חתימה אינה תואמת, או שהטוקן שיוצג פג תוקף, יוחזר מן השרת מידית שגיאת `401 { error }`. באם עברה בהצלחה היא תתעד את משתנה הבקשה באמצעות הגדרה כדוגמת: `req.user = { userId, role, name }`.
4. (מומלץ) תחת החלטה D-16: בדוק האם המשתמש מצוי כעת ברשומות והחזר מנגנון תקני של שגיאת `401` היה ונוצר מצב שלאחר הוצאת הטוקן שונה שם המשתמש השמור או שהנ"ל הוסר מתוך מסד הנתונים לחלוטין.
5. כתיבת פקודת ייצוא `module.exports = { authenticateToken, signToken }`.

**בדיקות (Middlewares):** בדיקה אודות כל אחד מהגורמים שאמורים להביא שגיאת `401`: אי הימצאותה של כותרת תקינה (no header), ניסוח רעוע כגון `Bearer garbage`, פקיעת הטוקן כאשר מדד `exp` חלף מעבר לזמן נוכחי, או טוקן תקני כלשהו שנשלף כנגד משתמש מחוק. הצלחה וודאית מול טוקן המוגדר היטב גוררת לקריאת מעבר מהיר לפונקציית ה-`next()` שתשאיר את תוכן הרישום בתוך אובייקט `req.user`. אימות מול פונקציית `signToken` יכלול ויאשר במדויק מציאותם של ערכי שדות של `userId`, `role` לצד `name` במבנה ההודעה, ואף יבדוק פער בין מדד היצירה (iat) לבין מועד התפוגה של כ-`exp - iat === 7200`.

**המשימה הושלמה כאשר**
- [ ] כל נתיב הקשור להוצאת תגובות שגיאה `401` מקבל כיסוי בבדיקות.

### משימה 6.2: בדיקת תפקידים (Role checks)

**קבצים:** `server/middlewares/roles/authorize.js` (חדש) · **מפרט:** §2.2, §6

**צעדים**
1. הגדרת פונקציית `requireSuperAdmin` אשר פועלת על אובייקט ומרשה לעבור כאשר ההגדרה מראה: `req.user.role === 'superadmin'`. תדחה החוצה כל ערך שאינו מתאים על מנת לקבל `403`.
2. יצירת פונקציית `requireAdminOrSuperAdmin` אשר מתירה מעבר באופן רחב כאשר תפקידי המשתמש הוגדרו כ-`admin` או כ-`superadmin`, אך תחזיר תמיד `403` במקרים של מניעה למקרה אחר.
3. שתי הפונקציות מסתמכות למעשה על קיומה ומיקומה הקודם של `authenticateToken` שתפעל לברר זהויות. אם נוצר מצב פתאומי ש-`req.user` מתגלה כחסרה משום מה - חסום והחזר התראת `401` מיד.
4. הוצאה תקנית לייצוא על ידי `module.exports = { requireSuperAdmin, requireAdminOrSuperAdmin }`.

**בדיקות (Middlewares):** בחינה אלגוריתמית של כל אחת מהפונקציות בעבור סך כמות התפקידים כולה (6 מקרים שונים מול צירופים), יחד עם אימות משלים להשלכות הקשות כלפי העדר נתוני כניסת בקשה ב-`req.user` מה שיאשר הוצאת הודעת דחייה כמו `401`.

**המשימה הושלמה כאשר**
- [ ] נבדק כל ייצוא (export) מול שלושת התפקידים.

### משימה 6.3: בדיקת בעלות אימונים (Ownership checks)

**קבצים:** `server/middlewares/ownership/ownership.js` (חדש) · **מפרט:** §2.2, §6

**צעדים**
1. הפונקציה `verifyUserOwnership` (עבור צפייה וידיעה למשתמש עצמו): מתירה כניסה באמצעות קריאת ה-`next()` לבעלי החשבון בלבד, לצד סוגי המנהלים כ-`admin` ו-`superadmin`. כל מי שינסה לפלוש במידת גישה של שולח רגיל כנגד קובץ זר - ייהדף החוצה ויידחה בסטטוס `403`.
2. `requireSelf` להגדרות כמו (יצירת אימונים): מתירה ביצוע תהליך אך ורק עבור המשתמש העצמאי עצמו בלבד ללא שום התייחסות לתפקידו ההיררכי הגבוה. במילים אחרות יתקבל סירוב אפילו לסופר אדמין שינסה לוגית להוסיף רשומות על שם מישהו שהוא לא הוא בעצמו. דחייה מידית → `403`.
3. `requireOwnerOrSuperAdmin` (בכדי לנהל פונקציונאליות של עריכת מסמך אימונים ומחיקתו בעת הצורך): בעל האימון הרשום (מכל סוג של הגדרה) יחד עם זכויות שימור למנהלי סופר אדמין פועלים למעבר. שאר תפקידי הגישה האחרים שאינם כאלה מוגדרים כישות בלתי רצויה. סטטוס של → `403`.
4. הגישה תיבדק אל מול הישות האמיתית עוד קודם שהמערכת מאמתת את מצב קיום הנתיבים (לפי D-14).
5. פקודת ההרכבה והייצוא `module.exports = { verifyUserOwnership, requireSelf, requireOwnerOrSuperAdmin }`.

**שים לב:** יש לוודא התאמת טיפוסים משום שכל פרמטרי הניווט (route params) הם למעשה בעלי מבנה פשוט מסוג מחרוזת מילים (strings). כדי לחסוך טעויות המר הכל למספר באמצעות הפקודה: `Number(req.params.userId) === req.user.userId`.

**בדיקות (Middlewares):** הקפד על בדיקת כרייה קטנה וברורה שתפעיל כל פונקציה אל מול הבעלים האמיתי של פריט התרגיל (המשתמש בעצמו), בנוסף לשיתוף בדיקות הדמייה של שחקני צד שלישי זרים (שוב, כל תפקיד כמו מנהלים ואף אדמינים רגילים או סופר). הדבר חייב ליישם מקרי קצה מרכזיים: אדמין שעוקף גישה פנימית ומצליח בקריאת הפונקציה של `verifyUserOwnership` לפריט שאיננו בבעלותו אך נכשל כישלון חרוץ מידי ונדחה במשימת יצירת קוד ה-`requireOwnerOrSuperAdmin`, במקביל לאדמין עליון שלוקה בחסר כישלונות פריצה בסיווג דפוס עבודה `requireSelf` עקב המגבלה הפנימית שלו להזדהות מול צרכים לא שלו בעת פעולה למשתמש אנונימי או אחר.

**המשימה הושלמה כאשר**
- [ ] כל ייצוא (export) מתוך שלושת קבצי ה-middleware נבדק בהצלחה.

**שער שלב 6:** קבוצת ה-Middlewares בבדיקות ירוקה. תעד את הריצה ביומנים השונים.

---

## שלב 7: ממשק REST API

**מטרה:** כתיבת וקישור פונקציות עבור כל חמשת הראוטרים שמופיעים תחת §8. כל משימה מתבססת על תוספת של נקודת קצה יחידה לחלק החיווט שנשלט במוקד העמוד מול `server.js`. הפעילות מלווה גם בכיסוי נרחב המיושם בקבוצת בדיקות (API routes group) תואמות: בהצלחתן יוכיחו את קוד ההצלחה הסטנדרטי לצד הבטחת הרצת מצבי סרק מכל זווית עבור פונקציה כנגד שיגורי שגיאה בלתי חוקיים ואפליקטיביים שיאשרו כי גופי ההרכבה המוחזרים תקינים לחלוטין וללא שיתופי סיסמאות בעזרת אכיפת הפעלת פונקציונלית המענה `assertNoPassword` הנדרשת בכל קריאת גוף למבני אובייקטים המוחזרים בתגובות קצה.

**תבנית מבנה כללית לקליטה או אכיפת נתיבים מתבקשים:**

```js
router.post('/', authenticateToken, requireAdminOrSuperAdmin, validateTraining, async (req, res) => {
  try {
    // 1. קריאת מערכת זיכרון ממוחשבת מקושרת   2. בירורי קונפליקטים על (409) ועל בדיקות של אי קיום כמו (404)
    // 3. יצירה והנפקת מופעים למחלקות המתבקשות  4. אכלוס אובייקטיבי והשמה לשימור על writeDB()   5. פליטה מהירה
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**מערכת כלי עבודה לחיכוך עבודה רגיל (Test fixtures):** צור פעולת התחלתית כדוגמת `before()` בעבור כל אחת מתרחישי הבדיקה לגיבוש עבודה קבוצתי בה המערכת תחולל דמיון מדויק על התחברות קבע במושבה כחלק מזיהוי תבניות לאדמינים וסופר-אדמינים כהשקפות יסוד (seed), ובעזרת הזרקות כניסת מופעים אצל שאר פקודי הקצה של בניית הרשמה עבור 2 אוכלוסיות יסודיות ככוח עבודה מסוג משתמשי הרשאה זוטרה מן השורה הפשוטה (זמינותם תלויה כבר מאז השלמה למשימה מרוכזת בתהליך קודם של Task 7.1). עקרון אופטימלי לבדיקות מחייב שכל תכנית חייבת להריץ ולייצר את התרגולים ולצייר את מסלולי הבדיקות מתוך אימונים חיים על תהליך משלה מבלי להסתמך ארוכות על השפעת הגדרות מקדימות של אימונים שחוברו בבסיס מערכי ה-Seed הקשורים.

### משימה 7.1: ראוטר אימות `auth.routes.js`: הרשמה והתחברות

**קבצים:** `server/routes/auth.routes.js` (חדש), `server/server.js` (עריכה) · **מפרט:** §6, §8

**צעדים**
1. `POST /api/auth/register` פניה אל (`validateRegister`): דרישה לשם תפוס זהה (case-insensitive) תובל לפעולה עם שגיאה מסוג `409`. תרחיש להצלחה יריץ הליכי יצירת הצפנה מבוססת טכנולוגיית פלט בטוחה של 10 סבבים תחת ספריות הקצה באמצעות `bcrypt` לטובת הבטחה פנימית. הוא ייצר באופן וודאי `new User({ ..., role: 'user' })` עבור אופי ההגדרה בהחלטה הפנימית (D-09), שילוח של פקודת שמירה אל הקובץ הפיזי ולסיום פעולת המעבר תתפרס בידי החזרת הפקת ההצלחה הבנויה בתור קוד המענה ההיסטורי המסווג כמספר ערך התגובה עם הטוקן המקודד יחד בתרחיש הבא כגון `201 { token, user }`.
2. קריאת אובייקטים באמצעות פונקציה מסוג של `POST /api/auth/login` (ללא צורך של middleware): תאתר ותסנן בעדינות את נתון הערך השמור תחת שדות הבסיס במחרוזת של שם ללא השפעת פקודות אותיות קטנות או גדולות, כולל חיסול צורת רווחים ריקים על ידי גיזום (D-10). ביצוע תהליך ההשוואה מול אלמנט הסיסמה מתרחש בשימוש המוחלט עם פונקציונלית העזר `bcrypt.compare`. נתונים שמצביעים לעבר סיסמה רעועה או לא תואמת, ומכאן אודות הזרקת משתמש בלתי ידוע ישלחו וירשמו כולם אל הודעת הקוד היחידה המשותפת והקבועה **לאותו מבנה אחיד בדיוק** מסוג השגיאה של המילה המרכזית הקובעת - `401`. קבלת סיום פעולה תקני יגרום למענה התוצאה להחזיר `200 { token, user }`.
3. חיווט אשכול המאגדים אל הנתיבים דרך: `app.use('/api/auth', authRoutes)`.

**בדיקות (API routes):** משלוח רישום להצלחה → פקודת תוצאה מהסוג של ערך הודעה כמו מתוך ה-`201` בליווי תהודה מתוך יסוד עולמי הכולל את פרטי אימות בתוך טוקן פלוס אפיון לתפקיד שחייב להיות על מודל `role: 'user'`, למרות עבודת קריאה משונה במידה והשדה מורה במופגן להחיל אל מבוקשו בגוף דרישות האדמינים בכינוי זהות בתור `admin`. הכנסת תבנית כפולה של זהויות זהות בשמות חריגים באיותן בשפה תדחה קריאה בסיווג שגיאה עם פקודת המעבר כדלקמן במצב השליחה ← סירב עם התראת מערכת בסטטוס התהודה והאימות מתוך ה-`409`. שליטה בטלפון דל מפרט בעל כישלונות עיוות ומרקם לא מספק ← ייצור מענה תדרי שדחה אל המבנה מסוג קוד ה-`400`. חיבור סמכות וזיהוי מסודר (Login) במערך הניסוי יסמן אפיק מוצלח דרך `200`. שיגור משימת שדרוג מדומה תחת פגיעה בניסוח בעזרת חידוד רעוע של הרשמה שגויה ופגיעת יריעות שמות שגויים מול שמות לא תואמים כגון קריאת מידע למשתמש עלום ישקפו ויביאו בעקבותיהם כליל את חותם שילוב התוצאות משתי הבעיות אל סיום צפוי במסגרת העברת מענה המערכת הכושל שנעוץ בתדרי החריגים באמצעות קו פליטה מתוך `401` כהוצאות מסרים אקוויוולנטיות במשותף ללא הרף והבחנה משמעותית. אף הרצת תוצאה אינה משמרת רסיסי פקודות או מרכיבי תוכן אל מסד הפקודה שעלול להיות כביכול משורטט בשליחות למילה הסודית בעזרת הופעת מנחים על אלמנט העומק המקרי במסגרת הקריאה כמו `password`.

**המשימה הושלמה כאשר**
- [ ] מקרי הבוחן עבור קודי הסימון של המדדים מתוך AUTH-01 וכן מהדוגמה של AUTH-02 קיבלו כיסוי ממערכי אופציות הדמיית השירות לאיתור דרך קבוצת הבדיקות האוטומטיות (automated tests).

### משימה 7.2: ראוטר אופציות `options.routes.js`: רשימת קבוצות שרירים

**קבצים:** `server/routes/options.routes.js` (חדש), `server/server.js` (עריכה) · **מפרט:** §5, §8

**צעדים**
1. בקשת `GET /api/options/muscle-groups` (דרישת `authenticateToken`) מחזירה מענה על קוד ← `200` יחד עם מחרוזת אלמנט כרשימה של סוגי ה-`string[]`.
2. בקשת POST בכיוון ל-`/api/options/muscle-groups` (פועלת בסיוע אישורי צמתים במקרה של: `authenticateToken`, בצירוף היתרי אבטחה כ-`requireSuperAdmin`, וכמובן על בסיס רגלי חוק האימות בסעיף `validateMuscleGroupOption`): כאשר הערך שהוקלד כעת כבר מופיע בהיסטוריית הרשימה המקורית הפנימית באופן קריא אך זהה מהבחינה של אי קריאות סמנטיקת מילים גדולות מול קטנות באופן שלא מתחשב בזמן הרישומים (case-insensitive) ← הפעולה חייבת להחזיר דחיית שגיאה מובנית במעטפת הרישום של `409`. אחרת המערכת תאמץ אותו, תדחוף אל סוף הרשימה (append), תבצע שמירת שימור בפקודת הידוק לדיסק `options.json`, ותחזיר חותם תקני בערכי קריאה עם שחרור תשובה בתור ← `201` הכוללת מתוכה את תוצאות סיום הרשימה שעברה עתה שינויים סדורים ומעודכנים.
3. חבר והנח את נתב הראוטר המתוכנת דרך עוגן מסלול שדרת נתיבי ההגעה אל סביבת ההגדרה הכללית ← `/api/options`.

**בדיקות (API routes):** קריאת מסלול על GET → תקרין הצלחה באות של `200` כנגד פלט עבודה עבור כולם ולכל מגוון התפקידים המסווגים, מול כישלון מידי לדחיית כניסה ללא הצמדת אבטחה הכרוכה במדדי הקבלה בסירוב אל פקודת מענה כמו ← `401` כנגד ניסיון ביצוע במצב נטול טוקן מזהה לחלוטין. בקשת עבודה מטעם הגשת נתיבי POST במאגר בחינת האפשרויות כאשר מדובר בסופר אדמין במערך העבודה תתקבל ותייצר הודעה ← `201` שמפנה ומעידה כלפי קבלת פני הערך התקין שנוסף כעת כחלק ברשימה המכובדת. מנהל אדמין ממוצע שמנסה לדחוף קריאות דומות בשלבי POST → ידחה באמצעות משלחי הודעת `403` לאמור שמקור אבטחת הגבול לא מתיר לו אישור כניסה, ובמשנה דומה גם במצב שבו משתמשים סטנדרטיים מחפשים דרישות לא רצויות יקבלו את עונשם במענה של סירוב חוזר ← `403`. הזנת שם משמעותי במערכת בעל ערכי דמיון מובהק לרקע הידוע והקיים על שמו של קו העומס מול ערך הקריאה מתוך הגדרת העבר למילה החוזרת באיותן כלשהו בסגנון `'CHEST'` → יגנוז החלטת הצלחה בעד שגיאה מידית שתתקבל בדומה ל-`409`. הזנה קריטית שיוצרת בעיות ניסוח בעת כתיבה מפורטת בצירוף טקסט הכולל הכנסת מידע מוקלד בעברית או סימני צד למשל → תושלך מנגד ותידחה בעוולת נכונות לא ראויה על סעיף חוסר קבלתה בשגיאת הקלט תחת חתימה מסוג ← `400`.

**המשימה הושלמה כאשר**
- [ ] תקן הבדיקה ממדדי ההשקפה על קודי המספר למקרה הדחייה אל RBAC-05 מקבל כיסוי בתוך מסלול הרצות של טכנולוגיית מבחנים אוטומטית כראוי.

### משימה 7.3: ראוטר תרגילים `trainings.routes.js`: כלי עבודה ל-CRUD בקטלוג

**קבצים:** `server/routes/trainings.routes.js` (חדש), `server/server.js` (עריכה) · **מפרט:** §2.2, §3.5, §8

**צעדים**
1. בקשת `GET /api/trainings` (מלווה ב-`authenticateToken`) מחזירה מענה קבוע באות הצלחה מתוך ← `200` במבנה נלווה שמכיל קבוצת פריטים מסוג מערכי העבודה כדוגמת קטלוג ה-`Training[]`.
2. קריאת היצירה עם נתיב מסוג `POST /api/trainings` (בעזרת מעבר דרך רכיבי `authenticateToken`, ולאחריו גורם מונע האבטחה אל `requireAdminOrSuperAdmin`, ותהליך אימות מתקיים בסיוע אל השדה הקבוע בעקבות ה-`validateTraining`): ניסיון להעלות ולשמור במערך משקלי המאגר נתונים כוזבים המנסים להוסיף סעיף תרגיל קיים שכבר באמתחתו עולה אותו משתנה כגון פריט של שם ולצידו סוג המקביל תחת שיפוט סמנטי זהה ללא תלות באיות אותיות קטנות (case-insensitive) → ייבלמו בהכרעה ובדחיקה מוגזמת כלפי טווח ההרחקה שיעיד על פלט אזהרה בקוד תקן דחוי כשגיאת הקיום → `409`. אחרת מהרו וצרו חיים בישות פקודת ההרכבה, שריינו את שימורה אל הדיסק בתהליך שמירת גיבוי, וסיימו בעד תשובת מערכת ראויה שחוזרת כתהודה מוצלחת עם המענה הפנימי מהבניית ← `201`. הגדרת קבוצת פקודת שריר אישי לתרגיל באופן בלתי מוגדר (custom `muscleGroup`) מאובטחת להישמר בכפיפות מוחלטת לעניין פריט אימון מתוך התרגיל בו היא מצוינת גרידא; והקובץ ההיסטורי `options.json` איננו נתון כעת לשום דרישות לשינוי עצמאי כתוצאה מכך (§8). השדה `includeCalories` נשמר כפי שאומת (`false` כאשר הוא חסר).
3. פקודת ההוראות המרכיבות מהגדרת צורת העריכה בשלבי `PUT /api/trainings/:id` (כשהיא משתמשת כביכול בכל תהליכי ה-middleware הקודמים כאותו הלוך לעיל): מתן דרישה לקוד מזהה אשר לא היה קיים משולם מראש → יוביל לחתימה בענישת המסר ← `404`, כאשר בחירה בשליפת שינוי למטרה מוכחת עבור שדות קריטיים על עקבות מילים תחת שינוי ב-`type` → תוביל מניה וביה לכשל באימות שיחזיר במאמר נדחה תחת דחייה בעזרת פקודת קוד ← `400`. הקציבו החזר חופשי לעדכון הגדרות פריט קריאות של המידע הפנימי והשמות בשדה כעין ה-`name` מלווה באפשרות צירופים לצורך כגון מרכיבי כניסה מסוגי משתנים נוספים של נתוני השלמה ב-`activity` (עבור עולמות האירוביקה) או השלמה באם תרצו של הקבוצה תחת אפיון מתוך `muscleGroup` (במקרה למטרת מופעי הכוח), תוך אכיפת ייחוד הדרישות (שגיאה אפשרית בסיווג `409`, בהתעלם לבדיקות המאגר מהתאמות על הפריט הנוכחי מול גופו העצמאי כמות שהוא), ותשיבו תשובה חזרה שמתעדת הצלחה גמורה כמסר → `200`. בתרגיל אירובי, PUT מעדכן גם את `includeCalories`.
4. הוראת השמדת התוכן מנתיב עזר במבנה שנקרא בתור צורות אדוקות לשדות ה-`DELETE /api/trainings/:id` (עם גורם זיהוי כניסה ב-`authenticateToken`, שמרחיק פעילים במאפיין שמירת גישה במניעת הכללים אל `requireSuperAdmin` בלבד): העברת פנייה לכתובת של זהות מספר מזהה לא ידוע עלום למערכת הקטלוגית תספק מכה ותחסם בסוף המבוכה בתעודת מסר פליטה → `404`. אחרת - עוררו מהלכי נטישה לסילוק והעלימו אותו מכל וכל החוצה, בצעו הידוק של שמירה לקובץ העבודה המעודכן, ושחררו לכל משתמש המתנת קוד תשובה הולמת לגישה מוצלחת נטולת מסר משתנה שנקבע במענה תגובה תחת סעיף ← `204`.
5. אימונים שכבר תועדו אצל היסטוריית המשתמשים בסביבות התיעוד על מחלקות רשומות כ-logged sessions תמיד מהווים למעשה העתקים צדדיים השומרים על גבוי נאמן לגמרי בעותקים הפנימיים החל מפירוט תכנים כמו נתוני `type`, הופעת משתני `name`, פרטי אודות זהות בסעיף ה-`activity` ומידע חקוק באופי מועבר אל סעיפי השריר התואמים מתוך `muscleGroup` וגם את הערך `includeCalories`, ועל כן פעולות זרות מבחוץ באחראיות נתיבי PUT ומנגנוני התחכמות בעזרת כללי ה-DELETE של התרגילים המשותפים לעולם אינם עתידים כלל להשיג דריסת רגל לשינוי אצלם אלא הם נותרים זכים בפני מגע חיצוני זר (§8).
6. חברו והציבו סופית את עקבות סעיפי חיווט הראוטרים למענה המטרה באזורי מרחב החשיפה הקיים של השלוחות תחת הסביבה של מיקום החותם שנקרא בכתובת המיועדת בתוך עולם הנתיבים והאפשרויות על זווית הבסיס במסלול תחת הנקודה המרכזית כדוגמת עמדות הניתוב הראשי ← `/api/trainings`.

מכיוון שרק אדמינים וסופר-אדמינים עוברים את `requireAdminOrSuperAdmin`, נתיבים אלה הם גם הדרך היחידה לשנות את `includeCalories`. אין צורך בבדיקת הרשאה נוספת (§2.2, §3.5).

**בדיקות (API routes), אפשרות הקלוריות:**
- `includeCalories`: אדמין וסופר-אדמין יכולים להפעיל ולכבות אותו ב-POST וב-PUT; משתמש רגיל מקבל `403`; `true` בתרגיל כוח → `400`. כיבוי האפשרות משאיר ללא שינוי אימון שכבר נרשם עם `calories`.

**המשימה הושלמה כאשר**
- [ ] כל הכיסויים עבור קודי הסימון של המדדים מתוך אזור RBAC-03 (על נתחי עבודה תרגוליים), וגם אלו שמדברים אל קטעי RBAC-04 (בחלקי מבנה API), RBAC-10 (חלק ה-API) ו-DM-05 (חלק הקטלוג), וכן למסגרות אודות קודי בחינה מדגם UI-10 (בחלק של פקודות בחינת שדרת API השלמה) קיבלו כיסוי ובדיקה בתוך מסלול הרצות של טכנולוגיית מבחנים על קצב אוטומטי מוסדר כראוי וכן עברו כולן בשלום.

### משימה 7.4: ראוטר משתמשים `users.routes.js`: ניהול משתמשים

**קבצים:** `server/routes/users.routes.js` (חדש), `server/server.js` (עריכה) · **מפרט:** §2.2, §8

**צעדים**
1. בקשת קריאת מזהים של `GET /api/users` (בתוספת העברת הרשאת כניסה לפי `authenticateToken`, וגם מסך גישה של `requireAdminOrSuperAdmin`) ← מפיקה קריאת הצלחה מלאה בעזרת הודעת ← `200` שמשיבה סדרה של רשימות מרובות כדוגמת `User[]`, הכוללת בנוסף להכל כנספח משלים גם את נתוני האימונים השמורים בתוך מערכות (sessions) לכל אחד בהתאם למבנה השלם שלו.
2. ניסיון בירור אודות בקשת `GET /api/users/:userId` ספציפית בעלת יעד ממוקד (בצירוף של מעבר מוסדר עם `authenticateToken`, בתוספת החלת ביקורת לאישור באמצעות `verifyUserOwnership`): כאשר המופע הרצוי איננו במערכת מכל כיוון ויוגדר בגדר לא מזוהה ← זה יגרור קריאת מניעה של `404`. אחרת - יופק מסר חיובי עם ציון לשבח מסוג ← `200` יחד עם התאמת גוף המבנה לנתוני ה-`User` ופירוט תכנים מצד מערכות אימון החיים שנשמרו שם בעבר בצורה תואמת וחלקה.
3. כניסה לנתיב של בקשות כמו `POST /api/users` (לצד בדיקה של אמצעות פקודות מחמירות בעזרת ביקורת מסוג של אישורי הגישה: `authenticateToken`, השענות לכיוון חסימת צד נוסף בדומה אל תוכן פקודת `requireAdminOrSuperAdmin`, וכל זאת תוך היסמכות של כללים אל תהליכים מזהים עם השמת כללי בדיקה בתוך קריאת פונקציית האישור המסמנת על דרישות `validateCreateUser`): אדמין משירות פעיל השולח גופי הודעה שמתיימרת בבקשת זכות קטגוריה ודרגה של הצהרת `role: 'admin'` תביא לדחייה מוגבלת מסוג משלוח הודעה אלימה כלפי חוץ כמו מסר כזה של ← `403` (לפי עקרונות שדוברו בהחלטה D-08), ותסריט של גילוי שמות אשר כבר תפוסים מן העבר אצל ישות קיימת תעלה התראה שתשלח לרוב בדמות הדחייה עם המלל הטיפוסי עבור כפילויות → `409`. מאידך גיסא אם הצליח מעבר מסונן חלק תבוצע הנפקת האש (hash) לשמירה בתוך מבני סיסמת הכניסה באופן הרמטי לחלוטין (password), לאחר מכן תיקבע יצירת הישות של אובייקט חוקי למשתמש, יבוצע גיבוי התיק בדיסק, וניתן לתת מזור עם אישור קבלה שחוזר כהצלחה בפס כזה מסוג של הנתון הרשמי: ← `201` בליווי ההצמדה למסגרות אובייקט ה-`User` אל קו המענה לפלט.
4. קריאת עוקץ לשם מיגור ומחיקה במבנה של הזרקת בקשת פנייה עבור נתיב כמו ה-`DELETE /api/users/:userId` (עם כוחה של גישה מתואמת בזרמים באמצעות הגדרת אמצעות לזיהוי טוקן `authenticateToken`, ועם הסמכת מעבר אדיר של השראת מניעות לאנשים זרים אלא פתיחת רשת בפני גישה מסוג המורשים הבלעדיים בלבד כדוגמת `requireSuperAdmin`): כאשר ישנה פנייה נדירה של מישהו המנסה להסיר את זהותו העצמית שלו (דהיינו, מחיקה למשתמש העצמי) ← דחה נסיון התאבדות מקוונת כזאת והחזר למערכת פלט אישור ודחייה תחת הערך של קוד מוסכם מסוג תקלה במענה ← `400`, ומול בקשת רשומות שלא מגיעות ומוסדרות בעלות מספר שאיננו זמין או הקיים או עלום בעליל ← זה ישיב באופן מהימן את סרגל הכישלון השמור לשם שגיאה עמומה מסוג של: ← `404`. מלבד זאת היה ופעולת המעבר תקינה וחופשית להמשך, השמד מיד ומחק באופן ניצח את תוכן המשתמש התורן (כמובן שמרבית הקשרים ההדוקים בסעיף האימונים - sessions, הולכים ונמחקים יחד כענן עמו ביחד כגורל כרוך זה בזה), תוך שמירת הגיבוי למאגר השלם (persist), וחזרת השלמת פעולה נטולת מסרים עמוסים בקביעת ציון הולמת מול קוד ← `204`.
5. אגד את מורכבות העבודה תחת ראוטר מסודר וייעד לו חיווט מתקדם שימומש כולו בפרופיל של מרכז הניתוב אל הפלט בנקודות הציר המיוחדות כמו קריאה לסביבת ← `/api/users`.

**המשימה הושלמה כאשר**
- [ ] מקרי הבוחן עבור קודי הסימון של המדדים מתוך אזורי RBAC-01 ובנוסף עבור הגדרות תנאי RBAC-02 קיבלו כיסוי ממערכי אופציות הדמיית השירות לאיתור הבוחנים האוטומטיים ללא דופי דרך קבוצת העבודה במערכות אוטומטיות מלאות.

### משימה 7.5: ראוטר אימונים אישיים (Personal session log) ב-`sessions.routes.js`

**קבצים:** `server/routes/sessions.routes.js` (חדש), `server/server.js` (עריכה) · **מפרט:** §3.2, §3.5, §8

**צעדים**
1. אתחל ויצר ראוטר המשלב פקודות אינטגרציה מעמיקות על ידי ההכרזה התואמת את דפוס הפעולה במשתנה כך: `express.Router({ mergeParams: true })` ובעת מציאת המסלול בחיווט מורכב מול השרת חבר אותו בבסיס ההרכבה לקריאות היוצאות מתחת לחזית קווי פריסת האפשרויות שעל הכתובת בנתיבי הניתוב התואם למבנה הנדרש בדומה אל הכיוון הזה ← `/api/users/:userId/sessions`. יש להקפיד ולמזג אותו תחילה בשלבים קודמים לחיווט של רשת משתמשים כללית עצמם (users router), כיוון שמסלול בעל מפרט אישיות נתיב כה ספציפי ומדויק יותר נועד לשמש כמשקל עליון ומוטב שייבדק ראשוני בעדיפות הראויה לו לפני השאר ולפני הנתיבים הפשוטים.
2. הגדר כלילת נקודת יעד ושיגור כגון הצבת מעבר קריאה תחת עבודת רשת עם המאפיין עבור נתיבי: ה-`POST /` (והשתמש כאן עם פקודות האכיפה המתואמות במופרד דרך הזרקות בדיקת זהות ב-`authenticateToken`, בליווי ודרישת עמידה הדוקה של רף פנייה שמופנה אל עצמו באמצעות פונקציית האבטחה המסווגת: `requireSelf`, יחד עם עזר מובטח משירות תקינות כללי המסונן בפילטרים מסוג: `validateSession`):
   1. בצע מלאכת העתקת רצף שדות בתוכן נתונים של פריטים פופולריים שמשקפים במובהק מצגים הקשורים לתכני זיהוי נבחר כמו המשתנים התלויים על הערכים הדרושים שהם: `type`, תחת ערכי זיהוי רצופים מול סוג נתוני ה-`name` יחד עם מרקמי פירוט משנה בסדר גודל שמור על שם דרישות המושג ← `activity` מהעתקות שישגרו מתוך פריט הקטלוג ישירות להדבקה מלאה למקום הרצוי. לגבי המקרים שמצריכים השלמות משימות מעולם אימוני סוגת כוח (Power), יישם תרחיש בו תקדים מילוי מראש (pre-fill) ושלב לתוך התיעוד ערכים מותאמים אישית לשדה קבוצת הכוח מול המאפיין תחת הגדרתו למשתנה ← `muscleGroup` שינבע בהכרעה מובהקת מתוך מאגרי הקטלוג באופן ישיר מלבדו (וזאת אלא אם הובהר ונדרש בסתירה מלאה שהגדרת המידע מצד אובייקט הגוף שמגיש המשתמש (body sets) הכריעה והכריזה לעצמה על דרישה לשינוי אחר באופן שקוף ומדויק מראש על פי מסקנות של הוראת (D-13) השמורה לדבר). העתק גם את `includeCalories` מפריט הקטלוג (§3.5).
   2. תיצרו אימון חי שמהווה העתק מבוסס מקור על עקבות מורשת תבנית הפקודה שהופנתה בסידור הצורה ← `BaseSession.fromJSON({ trainingId, ... })` וללא כלילת אובייקט השמה או הגדרה מטעם כוח פנימי לגיבוש נתוני משתנה שמגדיר את מזהה הרשומה כמו קוד מילוי כגון זה שישתקף בסעיף מספרי על הגדרת נתוני השדה כמו למשל: `sessionId`, בכדי שהישות שמנהלת קאונטר חכם תעניק זאת בכוחות עצמה בהמשך (על פי תהליך הפלט של idCounter).
   3. דחוף והכנס אותו פנימה כמערך אימונים אל מערכת יעד שמאחסנת קהילת מופעי פנקס היסטוריית העבודה של הלקוח תחת פרויקט תיקייה של המשתמש בעצמו במקום מיועד הממוקם במוקד הקיבול על משתנה בשם ה-`sessions`, ערוך סיום מוצלח בפעולה של השארת חותמת בעת קריאה לשמירת המצב וקבל גיבוי מושלם תחת דיסק הקבוע בדיוק לפי תקנים מקובלים (persist), ואז שחרר במאמר נרחב אל היעד הממתין מסרי אמונה תקינים בעזרת המענה הקלאסי כנגד פלט מוחזר במבנה מתוכנן בדגם ← `201` הכולל בצירופו כמובן את תוצרי האימון הרשמי יחד איתו, ובתוכו תקפיד לכלול בשפע נכונות גם את מבנה מילוי סדר ציון העמידות מתוך חישוב שבוצע למילוי תקן עומס בצירוף ה-`effortScore` שנקבע בתוצאה המקומית המצורפת על האימון. גם השדה `calories` נכלל בתגובה.
3. עבור מצב צבירת עבודת שדרוג בשליחת אפיקי נתיב בצורה של עבודת עידכון בעזרת שינוי מסוג עבודת `PUT /:sessionId` (פועל אכיפה מתחדש תחת הבקרים הפנימיים בהנחיית שילובי פעולות מתוך מבדקים בשדרות תהליכי `authenticateToken`, מתבסס בחיזוק מגורם על משלח דרישת כוח רדיקלי בעליל שמסתפק אך ורק באפשרויות הגמוניה למפעילים אישיים שמהווים יסוד למשפחת הגישה תחת שירות קבלה כמו זה שנבדק ונחסם ב-`requireOwnerOrSuperAdmin`, ועובר בסופו של עניין תהליך סינון אחרון מתוך תחום פעולות בוחנים אל קו המערכת בצירוף תחת `validateSession`): עשה השמה שקופה אך ורק לשדות היחידים שהושפעו מכוחה של הרכבה אמינה ובדוקה מול תקני כלל האימות המובטחים, שמהווים כמובן סך הכל יסודות תחת יכולות מתירות לפוטנציאל הרשאות המותר בהגבלת מתן פקודת רשות לעריכה רשמית וכוללת בעבורם בלבד, הידק תוכן מידי אל מאגר איתן בשמירה על דיסק בקביעות לשמירת פלט אמין (persist), ולסוף הנפק חזרת יעד אליו של מבחן קבלת תוצאת עמידה בסיווג ← `200` יחד בליווי צמוד אל הפריט של מערכי אימון בצירוף אומדן מחושב מחדש המשדר נתון מאוזן ויציב אל הערך שמצייר את מידות העומס מתוצאת מילוי פריט חישוב משתנה מעודכן על הנתונים כגון ← `effortScore`.
4. במקרים המכריעים למחיקה בפקודה הניגשת בדרישה לפעולה בסדר גודל שמעביר הוראת ביצוע ← `DELETE /:sessionId` (יחד עם גורמי מערכת כוננות בסיווגי אבטחה של אכיפת תהליך בעקבות בקשה שקוראת לדרישת העברת אישור של אבטחות המערכות בעמדות ה-`authenticateToken`, בליווי בדיקות מהסוג המונע במדדים שנועדו לכוחות אימון לבעלים מקורי והכרחי או לחלופין נגישות כללית ממנגנון של שליטה עליונה מסוג סופר אדמינים כדוגמת השלמות כגון כוח מסנן תחת הפעלות למרכיב בעל שם קודי עליון בסגנון אכיפה כגון ה-`requireOwnerOrSuperAdmin`): כאשר גוף המבקש מכוון אל פריט עלום במאגר זה יחשב למצב מסירת תרחיש טעות שגיאה קלוקלת מהשיטה ← `404`. מלבד זאת היה ופעולת המעבר מסתיימת בחלק ובבהירות המותר, השמד מיד ומחק באופן מוחלט, בצע הידוק לשמירה אל גיבוי (persist) על אובייקט הנתונים בדיסק המוחשי, והשב אל הלקוח המצפה למענה פסיק של קוד ניתוחי חסר תוכן כרוח הפלט בדחייה משלימה באמצעות הפקודה מול מספר הדחייה היציב החיובי מתוך אישרור כמענה תגובה תחת סעיף קוד ← `204`.

**בדיקות (API routes), אפשרות הקלוריות:**
- `calories`: אימון של תרגיל אירובי עם `includeCalories: true` מחזיר `calories` השווה לקלוריות שלו לפי §3.4; אימונים של תרגילים אחרים מחזירים `calories: null`.

**המשימה הושלמה כאשר**
- [ ] מקרי בוחן עבור קודי הסימון בלוחות הבקרה התקינים שמיועדים לשחרר אבחונים בסטנדרטים משורות עבור אזורי קטעי בדיקות מנועי ה-RBAC-06, נוסף להם אלו של חלקי מבחן מתוך ה-RBAC-07 יחד עם צירופים שמראים אופציות הדמיית השירות במערכים אל תצוגת רמות ממדדים שכיחים בסיווג מערכי ה-RBAC-08 (חלקים השמורים אקסלוסיבית עבור פריטי עמדות עבודה שסובבים נושאי אימון במערכים), ויחד כמובן בצירוף מדגם כללי מסביבת קודי הבקרה מן המוצגים שמורכבים אצל אישורי ניתוב קצה באסכולות של רכיבי מבחן מהמדדים שמדווחים בנתוני מחשוב ל-DM-04 (במרחב המוגבל שעוסק כולו ומשדר אל היקף ניסוי למרכיב מערכת בעלויות תחת שדרות קטעי API חלקיו המיועדים), וכן DM-05 (חלק האימונים), עברו פריסה ומבט מבחנים שכולם באמת מכוסים היטב במלוא התקינות.

### משימה 7.6: ביקורת ממשק (API contract audit) על עיקרי ההוראות השלמות

**קבצים:** `server/tests/system.test.js` (עריכה) · **מפרט:** §6, §8, §13

**צעדים**
1. סרוק וסייר ברפרוף כבד וקפדני סעיף אחר סעיף באופן שיעבוד וישווה תרחישים למול הכתוב לאורך טבלת הדרישות העולות בפרוטרוט לכל משתמש מתוך נספחי אזור §8 באופן רצוף כל שורה ושורה אחת ולגופה בעצמה (המונה במצטבר כ-15 מקרים ושורות מבחן שונים) במטרה לספק הוכחה חותכת שמוודאת שהלכה למעשה מתקיים לכל שורה ספציפית בעלת יעד ממוקד נתיב בעל עמידה ירוקה בבדיקה פונקציונאלית על מקרה הצלחה ופסיקה מובהקת בפירוש עם בדיקה לפחות אחת נוספת בעלת דחייה נדחקת במקרה כישלון מכל סיבה כעילה שהייתה במבחן שגרר כישלונות או פסילת שיגור לא תקין. תקן והתאם כל ליקוי הנדרש להשלמה ולטיפול במקרה שמצאת חללים לא פתורים כפי החסר במבחן.
2. אימת ואשר כי כל מבחני הקריאות למודולי מסלולי API אוחזים ומריצים בתהליך נגרר קפדני וקבוע ברמות הדקות במנגנוני ההרצה כלפי האובייקט שנוצר ביישומים המוחזרים תחת עיבוד נספח הקריאה כנגד אלמנט מנגנון התגובות להוצאת ביקורת הפעלת כלי אכיפה תקינים שנועד למנוע חדירות והדלפת סיסמאות בכסות הפונקציה למשימה הקבועה בניתוב מסוג `assertNoPassword` המורכבת על גופי תגובותיה של כל חזרה שמופקת למענה אל המשתמש.
3. הבטח ווידא בבירור במלוא הכובד על פני אישורים קבועים של פקודות שמבטיחות צורה שגורה לפלט התגובות כאשר נתונים השייכים אל עולמות בעלי מסרי השגיאה למענה מערכות דחויות שנבדקו בחומר הבדיקה על התכניות המריצות אכן מקבלים עיצוב זהה תמיד למשגור במרכב סמנטי מסודר המנוסח בקווים מאופיינים יחד על דרך תבנית קבועה ואחידה בתחומים של צורת כיתוב מן המתווה הפשוט ← `{ error: <string> }` למניעת קריאות לקויות.

**המשימה הושלמה כאשר**
- [ ] תוכח עמידה והפעלה יציבה על כיסוי משלמי ללא דופי על גבי כולם ממש בקרב סך 15 מסלולי חזית פתחי עולמות הקצה (נקודות קצה אלו מקבלות סיקור שלם לפי הרשום כקודקוד פלט משורת ניתוב מבחן העמדות והסעיף הרלוונטי על כיתוב ההגדרה של אזור ה-API routes row בענפי סקירת קבצי המבחן הראשי תחת הוראות במבנה התכנון של שדרות הערכים מתוך ה-§13), יחד עם אישור תמיכה שפועם ומראה תקינות על כיסויי ביקורת עמידות להנחיות שמגיעות ונשלטות מתוך צל ההבטחות בקודי סיווג בדומה לאלו שנבדקים תחת הדרישה להלכות במדד שמקבל עמידה בשורת תקן ← AUTH-04 ומספק תוצאת מענה חלקה לחלוטין שמורכבת על ידי כולם בצורה תקנית בסוף התהליך במערכות שבהם כוסו במיומנות מלאה ואבסולוטית כפי הצורך בבדיקות אוטומטיות לכל מקרי השיגור בעמדות הללו בקפדנות דרוכה.

**שער שלב 7:** נקודת דרך משמעותית בסגירת צלחת ההישגים: המנוע והשרת עצמו עומדים מלוכדים במקום מוצק והם כעת נחשבים למוצר פונקציונלי גמור ומושלם (במתאר חסר פשרות שמצוין במונחים טכניים בהגדרת אפיון כגון ← feature-complete), בו בשעה אשר סוויטת הבדיקות הכללית במלוא אורכה העצום רוויה וקורנת באור מנצח שמצביע על פס הישגים תקינים בכולן על צג המסך הדיגיטלי בצבע המנצח הראוי שנקבע אל מול איתות מזהיר המציג גוון סמנטי ירוק ללא סייג. בסיום וסיכום כלל מסע הפיתוח בענף הנוכחי, תעד וקבע במאגרי הרשת במדויק ורשום על לוח היומן את כל פרטי הריצה שעברו ברגע קביעת נקודת סיום המבחן לאחור.

---

## שלב 8: אימות הרשאות מסוג (RBAC Verification) והקשחה מניעתית (Hardening)

**מטרה:** שים זרקור להבטיח הבאת הוכחות חותכות בפועל שמנכיחות קיומה של מערכת תקינה המראה מנגנון הצלחה שצלח היטב בשלבי בירור עמוק של מידות המיומנות במטריצת אישורי ההרשאות החתומה והשמורה תחת מראי מקום קריאות הגדרות תנאים במבנה של צורת היצירה מתוך נספחי התיאום של דרישות הבסיס שעולות אצל ענפים כגון סעיף ה-§2.2 למתאר של מבנה סדר התנהלות רציף באופן טוטאלי המכוון ומכסה את צליחת הדרכים אל נתיב במונח המוכר על מתחם גבולות קצוות התהליכים (end to end), והבטח שימושים במעבר סקירה אחרון מקיף וקפדני כלפי מרחבי הבטחת מערכות קיומו של השרת במעקב והליכה בתלם אל מול עקרונות חוקי התצורה במדדי נושאי אבטחה וכמויות השגיאות שנרשמו טרם הרצת שלב היציאה במערכת לשם תחילת ביצוע מלאכות הקידוד לפיתוח רכיבי בניית מחוזות קווי צדדיות בעבור הצגת מסכי ממשק הלקוח האמתי במבנה החיצוני כקודקוד חזית מערכת חיוות המשתמש במבנה התהליכים הידוע בכינויו הקלאסי בקיצור כמו של ← (UI).

### משימה 8.1: הקמת יסודות משטחי העבודה של קבוצת מבדקים עליונים לסוגת ניהול המבחן הנדרש בדרגת מבחני אבטחת הרשאות ממשפחת ה-`RBAC test group`

**קבצים:** `server/tests/system.test.js` (עריכה) · **מפרט:** §2.2, §13

**צעדים**
1. באזור המוקצה במיוחד בתווך השייך לקבוצת מרכיבי המבחן למערכות האכיפה (בתוך תחומי מגורי רכיבי קבוצת ה-RBAC group), שב וצור כתיבת מבדק מענה חדש בסיווג מסלול השורות במתאר מוגדר היטב המורה בצורה מסודרת: **רק הרצת מבדק ניסוי מסוג של פעולת קריאה `it` אחת המכילה משמעות ניסוי תקין לכל תכלית סעיף משורה בודדת המציצה מתוך מגרת טבלת היסוד במטריצת מדד הסעיף שמבואר בחלק סעיפי ← §2.2** (כאשר המצטבר הכללי מונה כסך הכל בדיוק 16 שורות של קבוצות פקודה מבדקות, כולל השורה של **כלול שריפת קלוריות**). כל מערך עבודה שמייצר נסיון מבחן דורש שכל ביצוע ידרוש ויקיים אימותים מסודרים המקיפים את שלושת רובדי קבוצות המדרג של כל המשתמשים ותפקידיהם השונים בארגון השליטה (שלושת שכבות ההיררכיה התעסוקתית כפי שנחקק - roles): מענה שמצהיר כי גוף משתמש מורשה לכניסה משמעו קבלה ושידור הוכחות עליונות המספקות את הודעות מצבי שדר הסטטוס על ערוצי עמדת ההצלחה (the success status), מעבר לא מורשה מוגדר ומפורש לקבל מנת השפלה במערכי דחייה כמו דחיקות קוד מסוג התראת הסרת אישור ← `403`, בעוד קביעות סתמיות באישורים שנחשבים לסעיף שבו העמדה תצוין מראש שאיננה רלוונטית בסגנון תיוג חוסר תאימות תחת קווי רישום ענפי ההכוונה שנושאים את האותיות כמו ערכי הסימון ב-`n/a` מועברים ומוקפאים כדילקמן תחת השהיית תהליך במאפייני הדילוג המוצמד באגביות למסלול בתוספת עזרת צורת הנחיה בדרך הפעלת ביטול אנושי כדוגמת הצהרת התעלמות בהנחיית מראה של העמדת האות בעלת קוד כיתוב מצומצם תחת התגובה ← skipped בלוויית הנחת הערה קטנה מוקדמת שמציינת את פרטי כוונת המהלך המיועד (with a comment).
2. קבע להם תיוג זיהוי שם מתאים אשר מתייג כל הרצת בדיקת ניסוי במתן הכותרת המתחייבת הקשורה לזהות שם השורה שלה באותנטיות נכונה לכוונתה, לשם הענקת דוגמה מובהקת של יישום המקרה עיין כעת בתיאור המשפט כגון המתווה של: למשל ← `"Delete another user's session: superadmin 204, admin 403, user 403"`.
3. שלב פנימה והכלל במדויק בחוכמה ובחשיבה את שני מקרי הקצה הספציפיים (the two cases) שההנחיות המסודרות תחת סיקור פסקאות המבחן ב-§13 קוראות ונוקבות במוצהר ממש וממש צועקות להעמדתן באופן ברור ומובהק בזרקורי היצירה במלוא שמם המפורש (names explicitly): **אדמין שמפעיל אירוע אכיפה בכוונה שמוחק אימון ופעילות עצמאית של עצמו מתוך המאגר המשותף ← מקבל על כך שכר הולם כדוגמת הודעת מענה של 204**, וכן לעומתו השני שהוא מקרה **אדמין המנסה להעביר ולנצל הרשאותיו למחוק בסתר אימון פרי פעילות צדדי של מישהו שהוא לחלוטין אדם אחר ← ונדחה מיד בפקודה מחמירה לקבל עונש דחייה כמו עמדת מסר נטול אישורים ב-`403`**.

**המשימה הושלמה כאשר**
- [ ] כל המערך המלא בן 16 הבדיקות שנכתבו בעבור קווי מעקב אבטחת ה-RBAC שומרות על רצף מעבר בטוח בסיווג גווני השגשוג של תכונות שהן כולם ברורות וירוקות ללא מעידה קלה (green), ויתרה מכך כל פרט מהן באמת עורך ובודק סבבי בחינה על הצגת מצגי כל שלושת מסלולי ההגדרות עבור פקודי הגישה של המשתמשים תחת הגדרות שורת ההרשאות המדורגת במדרג התפקידים בשלמות (all three roles).

### משימה 8.2: סקירת ביטחון ובדיקות הסכמי שגיאות המערכת

**קבצים:** קוד השרת (server code) - בצע עריכה ותיקונים אך ורק באם הסקירה מגלה בעיה הדורשת זאת · **מפרט:** §6, §7, §10, §11

**רשימת הבדיקות לוידוא (Checklist)**
- [ ] כל מטפל ניתוב לבקשות קצה (route handler) באפליקציה עטוף בפקודת `try/catch` שמגישה מענה שגיאה מהסוג של `500 { error }`.
- [ ] גוף כל שגיאה במערכת מוכרח להיות מנוסח כ-`{ error: "<message>" }`, והודעות הסטטוס לקוד (status codes) עוקבות בדבקות אחרי החוקים מטבלת סעיף §6.
- [ ] אף תגובה החוזרת ללקוח לא יכולה לכלול את המונח `password`: תשובות לעולם מממשות סיריאליזציה (serializations) למשתמשים דרך המסנן הקיים על פונקציית הפלט `User.toJSON()`.
- [ ] שלבי ההתחברות (Login) מחזירים רצף טקסט הודעה מאוחד וזהה לחלוטין הן על מקרה משתמש לא קיים (unknown user) והן לגבי אירוע של סיסמה עגומה ושגויה (wrong password).
- [ ] מטען ה-JWT (payload) נישא בחובו בדיוק עם הפריטים `{ userId, role, name }` בצמוד לערך התפוגה כ-`expiresIn: '2h'`, והקוד הסודי מאוחזר בפועל מהנתיב במשתנה `process.env.JWT_SECRET`, עם הערת צד מגובה כהסדר קוד fallback לעתים השמורות כסביבת פיתוח בלבד (dev-only).
- [ ] רשימת החוליות בשרשרת ה-middleware כולה חייבות לשקף במלוא הדיוק המושלם תמונת מראה לעמודת דרישות המידלוור שבנספח טבלת §8 (Middleware column exactly).
- [ ] קובץ `server.js` עסוק ומהווה מעטפת המיועדת רק למלאכות חיווט והתקנה מול תוכנות רשת (middlewares) ונקודות מסלולי שרת (routers).
- [ ] בשום מקום אין שימוש בהצהרת ה-`var`, וסביבת השרת מיישמת לחלוטין כתיבת פרוטוקול של מודולי `CommonJS` לכל אורך הדרך.

**המשימה הושלמה כאשר**
- [ ] כל פריט מרשימת התיוג הבדוקה סומן ונבדק, וכן כל תיקון פגמים שיצא לאור זכה לגושפנקה מחייבת של שילוב עם בדיקה אוטומטית שמשגיחה ומוכיחה אודות תקינות המערכת.

### משימה 8.3: תיעוד עדויות אבטחה בצד השרת במבדקי רשימות קבלה

**קבצים:** `TESTS-LOG.md` (עריכה) · **מפרט:** §14

**צעדים**
1. סמן וערוך מעקב רישום למלוא תהליך סבב בדיקות המבחן הרצוף (the full test run).
2. עבור כל בדיקה מרשימת §14 שמבוססת טהורית לחלוטין אל רמת בניית קוד ה-API במערכת (purely API-level), יש לעדכן את מדד התוצאה כמרכיב `Pass` בצמוד לעדות שורת המבחן המפרטת את שם בדיקת השמות המקורי (cite the test names). (הערה: סעיף בוחן AUTO-01 נשאר ממתין לבדיקות שיערכו תחת מסגרות משימה 13.3).
3. מבדקים שקושרים ונוגעים לחלקים שעוסקים ומשפיעים על חזית קצה הלקוח כמו (UI part) - לדוגמא בדיקות AUTH-05, יחד עם בוחני ה-RBAC-04, וקטע בדיקה בסיווג RBAC-06 ואף גם השלמת המטלה שקשורה לבדיקות מדד על ה-DM-04, אלו יעמדו ויישארו על ציון הסטטוס במצב ממתין מסוג `Pending` מלווה בהערה מעדכנת כי "בסיס API ✓ הוכח", ולשמור במצב שכזה עד לשחרור צעדים שיובאו בהרחבת קו הסיום תחת שלב 13 (Stage 13).

**המשימה הושלמה כאשר**
- [ ] כל בחינה ברמת שדרת ה-API שנקראת מהלכות סעיף §14 כוסתה וקיבלה את תיוג העבר המובהק כ-`Pass`, מלווה על ידי הוכחות תקינות מוצקות (evidence).

**שער שלב 8:** קבוצת אבטחת מנגנון ה-RBAC מוגדרת כנקייה ומוצלחת בירוק פונקציונלי ובדיקת התיעוד מאשרת שמכלול הפעולה אכן נרשם ודווח במערכת היומנים השונים.

---

## שלב 9: לוגיקת עבודה טהורה בצד הלקוח (Client Pure Logic)

**מטרה:** להוות תשתית למערך כל מנועי ולוגיקות הפעילות העסקית הענפה שמוצגת בעבור ממשק הלקוח הנראה כיום (the UI needs). כולם ללא יוצא מן הכלל ישמרו וייכתבו בתוך כיתוב פונקציות מסוג טהורות (pure functions) ומרוכזות ישירות תחת קובץ הבסיס בסביבת `client/script.js` ללא חרך גישה מגע כלשהי לרכיבי אלמנטי הדפדפן (no DOM access). הפונקציות הנ"ל מוזמנות ויאובטחו בסיקורי בדיקות הנדרשים דרך מרחב העבודה במודול ה-Node (§11, §13). בהמשך לבניית רכיבים, קבוצות הפעילות בשלבים הבאים מהסדר של 10–12 יתאפיינו ותכליתן לספק חיבור חוטים אל מול המרחב של החזית התצוגתית (DOM).

**הגדרות מתאר סביבת המבחן (Test setup):** בתוך קבוצת קוד הבוחן המסווגת של צד הלקוח (Client logic group), טען וצרף את קובץ הלקוח בהשמה של ההצהרה `const client = require('../../client/script.js')`. כל משימה פנימית מעתה ואילך תוסיף בתורה פונקציה משלה בעבור עריכת אובייקט ה-`module.exports` בסיום ותחתית קובץ ה-`script.js`.

### משימה 9.1: קבועים מרכזיים בצד לקוח ופעולת המרת `toNumber`

**קבצים:** `client/script.js` (עריכה) · **מפרט:** §4, §9, §11

**צעדים**
1. סדר ושלב בלוק קבועים יחיד המשמש תמונת מראה זהה מול מערכי שרת האימות לבדיקות שבעברו: משתנים לזיהוי כסוגים (types), פעילויות (activities), קשיי הדרגות (difficulties), תפקידים, וכמו כן רשימות משתני פעילויות שנוגעים בענייני שיפוע וגם ברמת התנגדויות, לצד שתי תבניות עיבוד (the two patterns), בנוסף לאתחול חוקי מגבלות למספרים נכונים (לדוגמה מדד מקסימום על קו שדה המהירות נקבע ל-15.5, מדד דילוג (step) של מדרג ב-0.1, וכך הלאה בהתאמה לחוקים הרגילים). מעתה ועד עולם כל תגית הגדרת עבודה כגון `<select>` חייבת להיווצר בתהליך מורכב המגיע היישר מכוחות האצלה של המערכים הנקראים כאן (§9).
2. יצירת ההגדרה ב-`toNumber(value)` מניבה תהליך תואם ועוקב לכל אשר מבצע כלי פונקציית העזר מן השירות בסביבת השרת (server helper): הוא חייב להנפיק החזר ערך עם מספר סופי חוקי (finite number), או בתגובה נגדית להשיב מדד של מסר כשלי במושג של ערכי אובדן כדוגמת `NaN` עבור מופע של שדה שהושאר במצב מרוקן קלט (empty), דרישת תוכן חסרה (missing) ככלל או עבור תוצר קלט אחר שמורכב מהגשה עם טקסט בלתי מספרי בתכליתו.
3. הוצא אל פועל באמצעות ייצוא קוד גם את רכיבי מערכת הקבועים המגוונים, למען תאפשר לסביבת המבחנים האוטומטית להעמידם להשוואת נתונים ישרה למול הקבועים המקבילים שמקבלים ייצוא כפי שהוגדר במערכת השרת.

**בדיקות (Client logic):** שחק במקרי ההגדרה של הרכבי פונקציונליות השירות בסגנון בדיקת ה-`toNumber` ממש כפי שעמדת עליו בקוד ההליך המבוקש ממשימה 5.1 קודם לכן. אמת באורח צמוד (deep-equal) שמערכי הקצה המפורסמים במתחם הלקוח יהיו בחפיפה וסנכרון תואמים לשיווק המערכים אשר פוזרו בהצלחה תחת הוצאות ההקמה אל קבצי בדיקת אימות בשרת (exported by validate.js). צעד זה לוכד מיידית כל זליגת פער אי-תאימות שתיצור ותצביע על שגיאות היסח של פיזור חלוקת כללים בעבודה מתפצלת (drift between client and server).

**המשימה הושלמה כאשר**
- [ ] פונקציית העזר של `toNumber` מלווה בשדרת הקבועים המעודכנים מצוידים במלואם תחת פלטת ייצוא מורשת ועומדים ללא דופי מול מבדקיהם המושלמים.

### משימה 9.2: אימות קלט במערך הצהרת האימונים `validateSessionInput`

**קבצים:** `client/script.js` (עריכה) · **מפרט:** §4, §9

**צעדים**
1. הפקודות בפונקציית `validateSessionInput(input, { catalogItem, muscleGroups })` אוכפות ומנהלות בקפדנות את פסיקות הסדרי מערך האימון בדיוק שלמותו השמור לחוקי התשתית על פי סעיפי כללי התרגילים הרלוונטיים הנגזרים מקודי התנאי ב-§4 וזהים לאכיפת המנגנונים הנהוגה בעמדות תשתית השרת כפי שעוצבו במשימה 5.4. כתוצאת החזר מועילה היא תנפיק מתן שורת תבניות עם מסרי ביקורות ספציפיים (per-field messages) כדי לעדכן בתצוגה ממשית המופיעה מיד אל מול כל חלל שדה הולם שבו ניכרה נחיצות השגיאה, לדוגמא הודעה כזאת: `{ valid: false, errors: { speed: 'Speed must be between 0.1 and 15.5 km/h.' } }`.

**בדיקות (Client logic):** בדיקת קלט מוצלחת מסוג מערכי עבודה בתרגילי מפרט של (Aerobic) ולאחריה בדיקת תקינות המאשרת הרצות תקינות בקביעת מערכי הגשה עם תוצרי חוקים המוגדרים מעולמות (Power input) תזכה לקריאת מעבר ירוקה. בניגוד לנאמר שגיית קריאות זרות כדוגמת קלט הבוחן גבולות של ערך משתנה מופקע כמו `speed: 16`, משתנה דחוי באימון ריצה הפגוע ללא שום הזנה לשדה `incline`, הכלת הזנת טקסט אותיות ב-`reps: 'abc'` ואף הזנה בלתי מתקבלת מול תאריך שטרם אירע ונמצא כעתידי בכל מכלול מאלו יעוררו יחד תפוקת הודעת מסר שגיאתי מעודכן במדויק בסמוך ובחישוב מדוקדק אודות החלק הנפגם.

**המשימה הושלמה כאשר**
- [ ] מסך משתמש הקצה המקומי לומד לקבל וגם לדחות באכזריות שווה אישורים או שגיאות מקלט קבלות של מערכי אימון במינון מדויק וחופף לשירות כפי שמגיע מטיפולו של תשתית קבלות המענים בצד השרת באופן זהה לחלוטין.

### משימה 9.3: כלי מערכת סינון ומיון תחת `filterSessions` ואף ל-`sortSessions`

**קבצים:** `client/script.js` (עריכה) · **מפרט:** §9

**צעדים**
1. סדרי ארגון הגדרת `filterSessions(sessions, { type, muscleGroup, search })`:
   - בחירת כרטיסייה תחת סימון כולל של התגית `'All'` משדרת מסר של העדר סינון תרחישי מוחלט על שדה המשתנה שעליו החל הפילטור הנבחר (no filter for that field).
   - הגדרת מסנן למסכי סינון במיקוד השריר (muscle-group filter) מתגשמת ומקבלת התייחסות כללית באכיפה אך ורק אך ורק כאשר מסווג האימונים עוסק ופונה במוצג מחוץ לתכני הקטגוריה האירובית.
   - חיפוש במנגנון משתנה של שדה פנימי כמו `search` תורגם להתאמות רצף חיפוש לטקסט ממוקד שמבוסס תמיד בצורה קבועה (case-insensitive) בתוך עומקי פריטי שורות השם `name`.
   - כל יסודות תפריטי פעילויות הסינון מאוגדות למסך השפעה ביחד כישות אחת שלמה (All filters combine).
2. סידור סרגל מיון בשורת ביצוע של `sortSessions(sessions, { key, direction })`: בחירת מילת המפתח (key) מתוך היעדים שהם מגוון המשתנים כמו ערכי סיווג ה-`date` לתאריכים, סוג המעמד בשם כ-`name` או לפי רצפי מדד ערך הציונים המוערכים של ה-`effortScore`, כאשר שפת הכיוון (direction) פונה לבחירת רמות תנודתיות העולה בסיווג `asc` או הפוכה בירידה לזווית המסמלת `desc`. החזרת המידע כרוכה ומחייבת פליטת **העתק (copy)** בלבד וזאת בצורה שמורה להדגמת המסגרת (כמו בצורה עותק משוכפל כדוגמת `[...sessions].sort(...)`) ולעולם תחת שום פנים ואופן אסור לגרום להפעלת מוטציה המשנה קלט גופו המקורי של המשתמש (never mutate the input). כל פעולת סורטינג מתבצעת ומשפיעה לסידור העדיפויות במקום מתמשך מאוחר שרץ בתהליך שמגיע רק לאחר הליך סיום צמצום הפריטים שבסינון (Sorting runs after filtering).

**בדיקות (Client logic):** שילובי מיפוי מסננים מעורבים (למשל: סיווג על מידות מסוג פילטר מסוים + בחירת קבוצת מיקוד בשריר + והצגת מסכי שורת תוכן החיפוש); גורמי שדה הבוחנים על השפעות כיווץ באוסף סינונים לקבוצות השריר יעמדו בהתעלמות מוחלטת במידה וכתוצאה ישנה פעילות של תחום כושר בסיבולת אירובית כפעילות סוג הקביעה בבדיקה (type is Aerobic); כל שלושת צירי הסידור המגדירים תצוגת מפתחות עבודה מוכיחות פעילות בשני הקיצונים התנודתיים של כיווני מיון מעלה או מטה (in both directions); רשימת עותק השכפול של גוף הקלט הנכנס כולה נשארת רצופה ומאומתת תמיד ללא רבב במציאות מוגדרת כבלתי משתנה על זכותה העצמאית (left unchanged).

**המשימה הושלמה כאשר**
- [ ] כל שתי רשימות הפונקציות זכו לקריאת הוצאה תחת אכיפת חוקי הכלת פקודת רשויות ה-exported ומציגות אישורי כיסוי מוצלחות לכל התצורות וכן מכסות את כלל אפשרויות הגשת חיווי סינוני האפשרויות יחד אגף מיון המעמדות (sort option) כדברי הנחת §9.

### משימה 9.4: הרצת הממשקים להסקת סטטיסטיקה מחושבת `computeStats`

**קבצים:** `client/script.js` (עריכה) · **מפרט:** §9

**צעדים**
1. ספיגת פקודת הערכה אל חישובי המערכת ברוח `computeStats(sessions, { role, userCount })` והחזרת מענה שמכיל בתוכו ארבעה משתני מידע (values) נבחרים בסעיף של §9:
   1. נתון **משתמשים שסך נרשמו בסך הכל במערכת (Total Users)** בעד סך המנהלים (admins וסופר-אדמינים כמותם) לפי קריאת משתנה במבנה `userCount`, או במקביל עבור כוח עבודה יחסי אל פרטי צרכן הרשמה פשוט שיוצגו בפלט אחר עם נראות במלל הטיפוסי **כל סך משלל האימונים שנוהלו על ידי בסך (My Total Workouts)** ללקוחות (מבנה מספור אישי כמשקל האימונים הכולל שלהם עצמם).
   2. פירוט חישוב של **סך הכל המשקל המקסימאלי המוחלט שהורם (Max Weight Lifted)** באומדן מסודר (בק"ג): התוצרת שעולה בפער של חישוב הנתון אודות ציון קו המשקולת המקיף והגבוה ביותר שתועד אי פעם מעבודות שיגרה במגרת תרגילי ה-`weight` מסוג מופעי הכוח (Power).
   3. מדידת **קו ממוצע לסיבולת זמני קצב משך האימון האירובי (Average Aerobic Time)** (נמדדת במושג ערכי בדקות, ויוצרת גל עשרוני בסימון עיגול לקו נתון בספרה בודדת של מינימום כנקודה עשרונית מצומצמת - 1 decimal).
   4. מידע אודות **היקף סך האימונים בעלי רקע פרויקט משפחת אימוני הכוח השלם במערכות (Total Power Workouts)**.
2. הגשת מאגר מסדים ערום וללא ערכים של פריטים לחלוטין (Empty data) יצפה קבלות על תוצרי הגשה שיציגו סממנים קבועים שעומדים וינפיקו הודעה סטנדרטית בשווי דיווח אפסי תחת תווית כמו של `0` בצד הערכים, ולעולם לא להביא שום דפוס הכרזה הכרוך במלל מוזר שייפלט כחריג בעקבות תקלות עבודה בדוגמאות כגון הודעות מערכת המעידות על `NaN`, לצד המנעות מזליגת משתנים קצוותיים אל תחומי המסר על מצב מחוץ לתחום או בשמו כ-`Infinity` ולעומתו גם כתוצר השלמה בהמשך שלילתו עם ביטויים מסוג חזרה של העמדת חיווי כמו `-Infinity`.

**שים לב:** יש להתחשב בזהות תנאי בדיקות ההרצה כאשר הפונקציה במצב החוקיות כמתמטיקה עם תכולתה במצב כמו ה-`Math.max(...[])` צופה באופן עקרוני להפליט בחזרה משדר מסרים של `-Infinity`. יש לחמוק מפער סנכרון המצב הבעייתי דרך יצירת מתן עמדה בפירוש ובטיפול מהותי יסודי והחלטי על הגורל הצפוי כאשר גורם זה נתקל במרכב אשכול מערכות מקרים שהוא לגמרי ריק מנתונים נכנסים (the empty case explicitly).

**בדיקות (Client logic):** הרצות מעמד משתנה לאזורי תצוגה שסובבת צבירת יחסי משלחי בקרה (admin scope) ובדיקת תאימות מול אופקי העדשות למערך התיחום למשתמש מקוריות (user scope); ניתוח סביבת השמה מתוך נתונים כשרים למאגר של נתונים חשופים שרוקנו עד לכלות בסיס היסוד מהשראות חריגים; ובחינת מערך מעורב גדוש שיציב מערכות נתונים שהתוצאות האופטימליות לחזונו כבר צפויה והינן דבר שתוכנן אליו ברקע כמידע ידוע כהוכחה.

**המשימה הושלמה כאשר**
- [ ] מערך הבדיקות על כל ארבעת הערכים נמצא כחלק מתפקוד מובהק, הולם ונכון כחוק ברוח טובה עבור רשומות נתונים הנהוגות כמרשם לאדמינים, עמדות דיווחי רשומות המציעות משתמשי קצה כנתונים, במקביל למשלימות כשל קבלת פני מקרים עבור מאגרי מחשבה העומדים כמצב פקודות ריק לחלוטין.

### משימה 9.5: הרכבת המלצות מידע מועיל בבניית תחזית משדרים חכמים `buildInsights`

**קבצים:** `client/script.js` (עריכה) · **מפרט:** §3, §3.5, §9

**צעדים**
1. סדרת מערכת המשלבת הנחת יסוד להפקת המנוע תחת חתימת ה-`buildInsights(sessions, { today })` מספקת ושופעת למשלוח תמיד כחזרה מענה של מינימום עשוי מ-4 פסקאות או משפטים לכל הפחות, והינה דוגמא מובהקת לבשורה כדלקמן: הקבוצה בשריר שהושקע בו אימון בכמות הגדולה ביותר מכל המכלול (the most trained muscle group), נתח משך הפעילות הארוכה ביותר שעשתה בסביבה של יחידות במאמץ רצוף אירובי, שיעור כמויות ומניין מדגם העלויות אודות אימוני משמר שהוצאו במהלך 7 ימים מועדים אחרונים (workouts in the last 7 days), ויכולת התחקות לקבלת עדות מהערכה שמדווחת את תוכן המצב לגבי תדרי החשבון בסך חישוב קלוריות מהמופע האירובי שיצא לתוקף לאורך זמן מתוך השבוע הנקוב.
2. לחישוב kcal, סכם את ערכי `calories` שהשרת שולח באימונים שבהם הערך אינו `null`, כלומר אימונים שנרשמו כשהאפשרות **כלול שריפת קלוריות** מופעלת (§3.5, §9). הלקוח לעולם אינו חוזר על נוסחאות הקלוריות (§3).
3. ייסד בהקפדה אישית ולכל מאמץ הנחיה מוקדשת תחת הבטחה מילולית ברורה שהופכת שגרה בעמדות לצינור מפלט אשר כל אחת (insight) מתלווה במסר מסוג שורת תחליף חברית וקשובה שמכינה גלגל חילופי על ידי מילוי משפט הצלה והשלמה על ידי פקודת רזרבה ידידותית בסגנון עקיף ומנחם מראש במצב פגיעה שערוכה לשעת הצורך בעת חוסר רצוי בעד משבר היעלמות רחמנא ליצלן אודות אובדן גישה במציאות של דיווח על חוסר נתונים בשדות המדוברים ולציון מקרים נעדרי דיווחים מתאימים מהמלאי לפי חוק מוסכם מובהק בהחלטות שקועות אל קיר (D-18).
4. אפשר לחוק ההפקה להשתמש בהיגיון למאפיין הקליטה כגון על הערך לתאריך משתנה שכיח בשם הראוי בכינויו כ-`today` על מנת שיוצב בפונקציה מוגדרת תמיד באמצעות משתנה מילוי אישיות כפרמטר (במצב חסר דיפולט יעלה שווה ערך להפעלה אנונימית כ-`new Date()`) בכדי שהתנהלות שקשורה על סמך משפטים עם בסיס שמשמעותו חונה על ימי ציון תאריכים מקומיים יעברו חלק ומאומת בניסויי המעבדות (date-based sentences can be tested). בצע הכנת הדמיית פורמט קריא ברור אל טפסי עמדות של תבניות ערך בעלי צורת אופן מספרים הנדרש ונקבע באמצעות `toLocaleString('en-US')`, לדוגמה ברמות עיצובים כאלו כדוגמת עמדות המורכבות בהפרדה אלפית יחד בפסיק כמו - `1,240`.

**בדיקות (Client logic):** לפחות יעד הוכחה אל מניין בן מינימום כמות של 4 פסקאות רצופות מול גזרת מבדקים שיוכיחו מציאות ועיסוק בחומר תכנים על אודות בסיס נתונים אמיתי ובאותה קורטוב דרישה לעמידה בבחינה גם מול שפע עבודה המורץ כלפי מקרים לטיפול ברקע שנעדר לחלוטין מכל מערכות פריטי מידע במערכים כביכול במעמד מערך עבודה הריק לחלוטין; הבטחה חיונית שאין מנגנון שאחראי אל חוק המשפט שמכיל בשוגג צורת פלט מהסוג שתציג שגיאה מסורבלת מכל סוג אחיד בגין רגישויות משתנים פגועים כעין ערכי הפסד `NaN` ואף לא רשומות מועדות למחלת הופעת המושג על מילים מתווים למצג עובדה הנגועות תחת היעדר במעטפת גלויות כמו כינויי חסר במונח ה-`undefined`; הקביעה המוצקה בסדר מיפוי הזמן שמושקע ומציע מצע קיבוע של שיגור מקרה הזנה כמו על העמדה בפריט בעל ערך אירוע ידוע כיום עוגן שורשי העונה באופי קבוע בתור השם `today` במלוא חדותו מניב קציר שורת סכום מושלם שבודק תיאום יעד המסתיים בעד תוצאת השלמה על דקדוק תוצאות סיום על כדבר מדויק הלוכד משימת סף לחישוב מדוקדק אודות חפיפות הנסדקות במספר השכפול בממדי איגוד עקבת ספירת 7-ימי העבר האמיתית הנכונה בתוך מערכי קצה אקטיביים אחרונים בסך של תמונת המצב בכיסוי. משפט ה-kcal סופר רק אימונים שה-`calories` שלהם אינו `null`, ומציג משפט חלופי ידידותי כאשר לאף אימון אין ערך כזה.

**המשימה הושלמה כאשר**
- [ ] פונקציית העל פוצחת במסע מסודר שמחזיר כמענה פעיל אמיץ ללא הגבלה מצב של ציפייה קבועה במלוא יתרונות התשובה הנשענת בשגרה רצופה לעבר מספר מעטפת המכיל בתוכו צבר של כ-4 דוגמאות או כמות נרחבת גדולה אפילו כזו שיותר הימנה שיושבות בסוף סיומה בחוק משפטים מלא קריאות קבועות בצורה זורמת ורהוטה לחלוטין שמייצרת משמעות נאה לקריאה באור שוטף בספרות המילים.

### משימה 9.6: עוזרים (Helpers) פנימיים למשפחת המדדים של הגדרות רשימות קבוצת השרירים

**קבצים:** `client/script.js` (עריכה) · **מפרט:** §9, §11

**צעדים**
1. משלוח הוראה המהווה הכוונה ליצירת הגשת מידע תחת `buildMuscleGroupOptions(list, { withOther })` תעבד שורת מעבר המסכמת פעולה שמשיבה קלט תחת חתימת ה-`[{ value, label }]`, על אף הרכבה יסודית המסננת בתוספת צירוף לתוך כניסת תוכן תיאורי פנימי כדוגמת שורת מאפיין בדומה לעקרון: `{ value: '__other__', label: 'Other…' }` כשזה האחרון צומח ומודבק נספח (appended) אך ורק בתוך תחום מקרה ההשפעות שהרף על אודות מדד ההגבלה למקרה שעזר למשתנה `withOther` מצביע על נכונות אמתית ויציבה בקביעת היותו - true. המבנה האסתטי השייך כמו המלצה גורפת עבור צורת פורמט שיעוצב עבור הכיתוב על החתימה שבערך התווית למערכת ההגדרות ב-label, שוכן לבקש כי על המופע לתאר את מראה חזות הפריט עצמו אלא תוך גילוי שמדגיש פתיחה מאורגנת שמדברת בגילוי שמות בעלי מכתבי אות גדולה כפתיח כותרתי בתחילת אותן מילים (capital first letter), הרי בדרך דוגמה מוכחת אם כך מונח שנכתב בסיווג של ערך כמו `legs` יהפוך את הקליפות עד להיות נראה תחת פני הפלט בתור המצב הראוי שמוביל הלאה לפתיח המסוגנן כפי מראה הדרת תווית המאפיין על - `Legs`.
2. קריאת ביצוע מן המערכת בחתימת `resolveMuscleGroupInput(selectValue, otherText, list)` מביאה להנפקה מתוצר של החזרה שיחזור מהשלמות על המידע הנדרש כמתבקש כעין מבנה כמו ה-`{ value, isNew }`. בזמן מסוים במידה ועולה נתון בחירות במשתנה שממנו נבחר בתיבת הבחירות במקרה איתור של `selectValue` שעלה והורה בצורה חדה כזיהוי מצביע על ערך כמו הכיתוב על `'__other__'`, מתקבע במערכת הליך משימה שעליו להשתמש במאגר הכיתוב המיובא מהפרט של מלל ה-`otherText` לאחר שהנ"ל טופל וסורק משאריות גיזום ומיושר ברווחים (trimmed) ונוסח והועבר לעמידה בקו אל רשימת הלקסיקון שעומדת בצלילים על קווי איות מהזן של קו אותיות קטנות ללא פשרות (lowercased). אפיון התווית בשדה מציין החדשות המסמל גבול היכר מהותי במערכת כמו `isNew` יאיר זרקור לסימול כאות המעידה במקוריות כהכרה עובדתית בחותם הצהרת של מדד הנכונות האבסולוטית ועל משדר תקין על הגדרת של אימות בקיום היותו במצב מאושר (true) בתצורה בלעדית אך ורק במקומות כגון באלו שהוקצו שרק כאשר מתברר כי הטקסט ההוא כבר כעת כלל אינו מצוי כלל במרחב הספציפי במקומות כמו שמסביב לרשימות המערך השמורות המצויות במרחק מסוג שכזה כפי המקבילים במערך שבשם `list` (תוך הדדיות רצויה שקיימת על ביטול חוסר ההקפדה על גודל פסיקת האותיות במבנה של צורת אפיון חקר בסיווג זהה להעמדת מצב במערכי התייחסות המביטה על הכללות סמנטיקת רגישות אופי אות הרישום בצורה שמכונה באופנים כ-case-insensitive).
3. חלוקת תפקידי המערך מסוג בירור הזכויות בדרגה הרמת מעלות הפקודה באמצעות העברת שלב כמו שמכונן בהפעלת אובייקט במילה `shouldOfferAddToList(isNew, role)` ישקף נתון פסיקתי המאשר מצב שווה למבנה תצוגת ההחזר שמדווח מרווחים ששמורים למציאות הדרוכה ביציבה של הוכחה הדוגלת שמצב בו מקרים מורכבים במצב ← `isNew && role === 'superadmin'`.

**בדיקות (Client logic):** שחק במדויק בסעיפי כיסויי המבדק שזהים במלוא מובן הפתרונות לדוגמאות הבוחנות הכלולות מתוך יסוד הפקודות והמצבים כפי הגשת מקרי §13 לחקירה מדוקדקת (the exact §13 cases):
- הרץ ניסיון של יצירה עבור `buildMuscleGroupOptions`: נסה לבחון פעולה מלאה עם דחיפות בעלת נוכחות עוטפת, וגם בדוק ללא הימצאות עננת הוספת נספח שמתאחד לצמיחה בתצורת תוסף הדגל השולי שנושא עמו את גב מסר צירוף הפקודה הנדונה בקיום כמו המערך "Other…".
- העמד בנקודת אכיפה כלים כדוגמת מנגנון הכרעה שב-`resolveMuscleGroupInput`: החדרת נסיונות עם הרצת השלמות בחירה נפוצה שנשענת על הישענות באופציה הקיימת שרירה ועומדת (an existing option) → אמורה להחזיר מערך משמעות המגלה גבול ירידה במצב קיום המשתנה בשדה החדשות בביטוי מונע ← `isNew: false`; הבעת פלישה עם ניסוחי טקסט בעל נופך מחדש לחלוטין שלא מן העבר במתואר במאגר המידע (new text) → תיענה למסר שקורא לעבר הקפצת שדה התווית למראה שמסמן נכון ← `isNew: true`; הכנסת עיוות אסטרטגי המציע ביטוי מלא זלזול והזנחת גדלים מסורבל כגון ההקלדה הפרועה של דרישות בקליטה מול מלל דוגמת הפלישה של מחרוזת המעטה החסר ← `"LEGS "` שאגב מתגנב ומועבר לתוך שירות מערכת הכניסה כחלק מטופס הפניה הנסמכת מפיק המילים השמור על הכתובת כעוקף סיוע לממשק נתונים שבשדה האמצעי במקרה המציין גישה מצד אלמנט העזר בזהות דרך שביל מוצא רחב כמו בעמדת גורמי דלפק האחור לתווית דרך מסתור בשם הכיתוב שנועד לאפשרות (via Other) → תוצאה מחויבת במבחן להוציא מערכת מדויקת שבולמת ומסדירה הרכבה נקייה שמחזירה תיקון מסודר הדומה אל חתימת האובייקט שייווצר כדלקמן למשל ← `{ value: 'legs', isNew: false }`.
- בקרה בתחומי הפעלת אישור של הכוונה לפניה מן השירות ב-`shouldOfferAddToList`: מנהל סופר-אדמין עליון שמצויד במלווה אל גורמים אשר אוחז בערך משתנה טרי מסוג נתון שטרם נודע ממקודם בהכנסות כוונת חדשה (superadmin with a new value) → משתלב ומתנגן בפלט שמצייר לו סוג זכייה מאושר כחוק שמחזיר באות תקין מעמד המאשר בסיווג ← `true`; בעוד שקריאה אל מנהל משתמש מסוג אדמין ממוצע פשוט העורך מופע הכוונה כניסה באותו המצב עם רכישת וגילוי הוספת ערך מאותה ליגת מעמד חדש בעצמו ובשלבי תפקידו הנמוך ממנו בעליל (admin with a new value) → נדחית לאלתר מלקבל סיפוק ואישור עליון ונחסמת באיסור המשיב למצב התהודה באות מסמן מבוטל בדחייה של ביטול המונע מתן תוצאה בסגנון משיב של אבטחת סירוב בעמדה אליו כמו ← `false`; וכמו כן סופר אדמין שעוקף הגדרות יצירה ומאתגר עם הגשת נתונים המעידים על מנתון פנימי העומד בחקירת ערך קיום שכבר שריר ובעל ותק תחת מרכזי ערך הקיים במאגר ממילא כבר מן העבר מול ערך הקיים במאגר בהווה במסגרת מלווה בקיום ערך ותיק השמור היטב והשריר כבר במסד הנתונים שחזר שוב אל המערכת במודע (superadmin with an existing value) → סופג בעד מניעה מערכתית הדוגלת במדיניות כפילויות שישגר לעברו מחסום מתן המענה שגם כן אצלו מצייר בסיום מבוטל פקודת דחייה מסוג של עצירה כמו ← `false`.

**המשימה הושלמה כאשר**
- [ ] כל השלישייה מחבורת עוזרי המערכת מקבלת טיפול ויציאה מורחבת בהעברת מידע למקום מבטחים שמיוצא החוצה מנמל המערך (exported) למקורות רחוקים בממלכת ייצוא מלאה, וכי כל מעמד מקרה הדן וסובב את מסקנות הדוגמאות כפי שבסעיף ההקפדה על הנתונים במקרים הכתובים במפורש אצל מדד בדיקות הקבלה ב-§13 נוכח ועומד בהצלחה על תנאי מעבר שמור ובטוח בקו עבודת האכיפה בדרך הפתרונות והצלחתם המוכחת שצולחת ועוברת ירוק בביצוע חלק למופת לחלוטין (passes).

**שער שלב 9:** משפחת הקבוצה על ענף הלוגיקות הקיימות בצד מבחני הלקוח מעבירה גוון של מסך ירוק תקין בכל תכולתה המושלמת, והציגה בתוצרת את כל מכלול רשימת התשיעייה המבוקשת מתוך שדרת 9 חוקי פעולות הפונקציות הנקובות בייעוד מסעיף הדרישה במפרט על קובץ סעיפי המידע שב-§11 והוכיחו נוכחותם על מעמד שיצא אל העולם באמצעות מערכי ייצוא מהייצוא המורשה להעברתם לפליטה החוצה לאזורי הקצה הנחוצים (exported) במקביל לכך שעמדו בניסויי המעבדה בקרב בדיקות מחמירות באופן רציף (tested). תעד על נייר היומנים למעקב ותעד את הריצה המדוברת בזאת.

---

## שלב 10: מעטפת הצגת שדרת הלקוח ועיצוב ממשק רכיבי מערכת האותנטיקציה להליך ההתחברות והרשמה בסביבת UI (Client Shell & Authentication UI)

**מטרה:** כינון מלא ושגרת טיפול בתצורת בניית התכנון למבנה עמודי האתר ותפקיד מעטפת המסך (the page structure), הקמת קווי עקרונות תשתית סדרי מידות ועיצוב למערכת הגדרות הויזואלית הנדרשת מן המעצב (the visual design system), ויציקת סדרי הזרמת חזון מערכות זרימת הפעולות הכוללים מנגנון נושם וחי המחבר צעדים ופועל על ציר עבודה תקני בעבור שלבי לוח חיבור המשתמש לטופס התחברות חלקה יחד עם מופעי הליך הירשמות ורישום משתמשים המותאמים בזרימה למחזור החיים וגלגולי תחזוקתו של הטוקן המוצפן השמור בכלי הזיכרון בלבד כפי שדורש ונבנה במאפיינים הדקים השאובים מחוקי הבקרה שהוקפדו בעברו מול סעיף נתיב הדרישות ב-§7.

### משימה 10.1: סדר ארכיטקטורה מבנית על סמך שימוש בתגיות מיקום כגון כתיבת עמודי משמעות והיררכיה כקוד סמנטי למבנה שדרת הדף (Semantic page structure)

**קבצים:** `client/index.html` (עריכה) · **מפרט:** §9, §10

**צעדים**
1. באזור מתחם פתיחת קצה תגית מסוג רכיב ה-`<header>`: הכנס כיתוב מסקרן שיישא במתן שלטים לממשק הכותרות שמציגים את שמם של האפליקציה בייצוג של פרויקט עליון (the app title), איתם תשלים מחיצה ומיקום אשר יעלה וירים תצוגה שתיקח בחשבון את הופעתו של חותם שיגיד את שם זהותו של המשתמש הנוכחי אשר במצב זמין במערכת עכשיו (the current user's name), הקצה גורם סימול לתג מעמד ככוח לציון נתוני תפקידים בשליטה מסוג ייצוג מעמד צבעוני לכל תפקיד במערכת של אות קבע בדמויות תג השיוך המזהה בטבעת תפקיד בסגנון לוח אליפטי מסוגל (a role badge), וכל זה יחד עם התקן גוף קיומו של לחצן שליטה הפועל כמשגר כפתור פקודת עזיבת הרשת למשימות התנתקות והתרחקות כפתור במעמד מסר יציאה כדוגמת השם של ניתוק (Logout button), כל אסופת נספחי הרכבות הבלוקים שהוזכרו בקצה העמוד הנ"ל באלו חייבים באופן עקרוני ומובנה לשהות ולהישאר תמיד מוסתרים בדרך קבע מעיני העולם החיצוני בכל עת למראה תצוגה תחת מצב שמירת אלמנטים עלומים עד לזמן אשר המשתמש יגיע לכדי השלמת גישה בטוחה וביצוע פעולות אישור למשימות ועד אחרי הוכחת הרגע שייקבע לאחר שימלא סוף למערכת מעבר צליחת הכניסות בצעד שעבר התחברות וזיהוי פנימי בהצלחה (hidden until login).
2. למרגלות יחידת בניית צירים ספציפית ומיוחדת שתאובחן למודל הגדרת מקטע בתגית העוטפת ומתויגת בקוד הכתוב במראה הזה על בסיס רכיבי של: `<section id="auth">`: הצב תחתיו בניית שני אזורים למסכי לשוניות עבודה נפרדים והם הלשוניות השייכות לתחומי קו התחברות מסוג עבודה של כניסה למערכת (Login) יחד עם אזורי מסכי העמודה של רישומי הוספת נרשמים בלשונית הרישום (Register tabs), כאשר כל כלי ממשות שבאחד מהם מרכז ומאגד כאי ברור פנימי לעצמו מערך תפקידי נפרד לחלוטין מן האחר שייווצר כמעטפת טופס בנוי בשלמות למטרה המסוימת שינוצל לביטוי על ידי עטיפת חותם התגית מסוג העבודה והשיגור אל פקודת מרחב ה-`<form>` שלו הוא מיועד, בתוספת ציר שיכיל שדרת תיבות קליטת משתמש עם מעטפת הזנת שדות קלט למילוי מידע משולבים יחד בד בבד עם ליווי עמודי תוויות טקסט מכוונות לשימם שמכוון במראה שייעד אזור עבודה מסודר לעיני הגולש על גבי חיבור תוויות מדדים בעבור התאמת שדות הכתיבה בטפסים יחד (labeled inputs), ויחד עם הרכבת נוכחות שתשלב גם יסוד הופעת גוף אלמנט כרוך לאורך קו הטקסט פנימי המשמש רכיב שידור מקוון להעברת חיווי מענה שמתמחה בפריסת הודעות שגיאה מקומיות בעת הצרכים (an inline message element).
3. החלק הפותח ששם יינתן עיצוב לעמוד הגרעיני בסדרה המובנית בעמודת הבסיס והליבה של אזור פתיחת הפאנל אשר מכיל ומציג נתוני צליחת העיקר במרכז השליטה במראה שפונה אל הלקוח בתגית בעלת מבנה וייצוג פתיחת קצוות תחת העצמת אזור הניווט תחת `<main id="dashboard" class="hidden">`: הוסף פנימה מתחת לאזור פקודתו רשומות מחולקות בקווים של עטיפת טווח כל יסוד אל נתוני בלוק מרכזי נפרד באמצעות גדר מתחם עם חותם מסוג תגית אחת במידה יחידנית לכל חטיבת נושא שתיעזר בעטיפת קיר הפרדה במראה הפיסוק שמגיע ונועד עבור קידום השלמה המגדיר הופעת כל ישות במקטעי סוגת התגים שקרויים כ-`<section>` אשר תוכנס עבור ביטוי לכל מכלול במאפיינים לכל אחת ממרחבי פעילות של פיצ'ר אפשרויות לניהול במערכת שדרוש מופע נפרד משלו כראוי (one per feature). סדר מערך זה כולל בנייה וטיפול פנימי במסכי הכרטיסיות הבאים בתור כרשימה: אזור הוספת הרכבת משלח לפקודת אימון חדש לעבודה (Add Session), חתך סרגל כלי הגדרת כיווץ חיפוש מול אפשרויות תצוגות הסינונים וכלי ביצוע של אמצעות דירוג רשומות לפי בקשת מיון סדר (Filter & Sort), מרחבי פאנל הקלפים והצגת רשימות הפריטים שמהווים הליבה בסעיף של צג מסכי הצגת רשומות האימונים השמורים כסדרם ההיסטורי בספר העבודה (Sessions), מגרש מלבני שמציג לוח בקרה העוקב להעמדת הצגת נתונים נגזרים להתרשמות למראה מדדי הסטטיסטיקות במקום קבוע (Stats), מסך נתונים שפולט משפטי הפקת לקחים כהמלצות מסקנות שייעצו תחת דיווח עבודות מערכת קשובות לשיקוף על כושר הפעולה בתובנות (Insights), עולם הרכבות פריטים שישמש את צרכי הניווט השמורות בסביבת לוח מגרת קטלוג התרגילים הכולל פאנל העמדת טופס עריכה נלווה אל בניית פריטי היצירה מול מערכי עיבוד התרגילים למילוי (Exercise Catalog with the exercise form), וכן גם לשכת המנויים השמורה לשם ניהולי קבוצות רישומים במגזרי כוח המשתמשים במערכת (Users), כאשר במקום ההוא חובה להכיל הן את בניית מערך יצירת הלוח למי שמיועד לו זכות הבאת חבר באמצעות הגשת מסכי קליטה של חיווי משתמש בהקמת ציר העבודה לטופס יצירת המשתמש החדש (the Create User form) ואת חלקו של הלוח שיועד לשיקוף נתונים פשוטים של מעקב והנפקת תצוגת רשימת הישות לכלל המשתמשים עצמם בתוך חלונות הצפייה שבאזור משטח השורות המלא מכל אלו העוברים בסך לעיוננו המלא הממוקד אל תצוגת הרשימה לאוכלוסיות העבודה יחד (the users list).
4. חובת אכיפה אדוקה על דקדוקי שורות הציוד המיועד לכל טפסים: על כל פריט קלט מידע או הזנת חלל המאפשר כתיבת שורות הוספה לקליטת עבודות ממשתמש ללא הבדלי סוג כמו תיבת הקשה למילוי בשדה (input) להיות בעל מראה מאובזר במלוא הצורה המסודרת תוך הגשת היערכות בעלת פריט מיקום צמוד יחד בצורת שילוב עטיפה שיקרא להוספת חותם התגית מסוג העבודה של כותרת הצהרת כיתוב שמהווה שילוט עליו בעמדת המסמן כעמודת תיוג איתו מסוג תגית בכינוי השם ← `<label>`. ועוד זאת בנוסף כי על עזרת כל חיווט אל פקודת העברת מעטפת גדולה שמאגדת בתוכה רישומי תיבות כצורה השייכת לגזרת טופסי העבודה או השדרות שמחזיקות במערך חוקים כעין ה-`<form>` יחד עם תפקידי אבזור מערכי הקלפים וליבת לוחות תצוגת שירות כרטיסי הרשומות לאימונים ולתרגילים בבסיס העמודות שעל כל רשומת פריט במבנה כעין קלפי ה-card יחויבו ויהיו מצוידים במעמד הקמה של חובת חקירה פנימית לכלול קיומו של אלמנט שורת מסר מקוונת מובנית בקו הפנימי של התוכן הנמצא יחד ומותקן עמו לצידו אל מעמד שנועד להעברת דיווחי תקלות שילווה על דרך ה-inline message element, על מנת להבטיח זמינות ונגישות בעלות תפקיד משדר הכוונה מסודרת לשידורי תיקון ומעידות (כאשר אזור תגית רכיב העדות הנ"ל יחזיק ויכלול הצהרה עקבית שמשלבת יכולת הקראה חיה לצורכי נגישות קוראי המסך תחת שורת תכונת הבניית ערך אליו המצוינת בניסוח המציין ← `aria-live="polite"`), וכל אמצעי זה מיועד אך ורק להקמה על מנת שישקף ללא הרף אך ורק את פלטי הערכים של ההודעות אודות גורמי בעיות או שידורים של מערכי תקריות הכישלונות בממצאים העוסקים והמתעוררים לצורך ציון למשל בתקלות חמורות כשגיאות מערכתיות שיצאו מגדר השליטה במסגרת דיווחי פקודות על יעד המערכת על שדות אלו כדוגמת שידורי התקריות למסגרות אלימות למעמד העברתם לתוכן בעבור התצוגה הממוקדת מול מקרים כמו למשל שגיאות באותיות errors, כיוון שידוע הדבר מראש משום שחוקת פקודת הברזל אשר דוברו והוחלטו בהיקפי המסמך בסעיפים כעין מגילת ה-§9 אוסרים איסור חמור מהחל ועד כלה להשתמש מעתה ואילך באף כלי תכנותי שיתעורר לביטוי על ידי עוררות דרך גוף סביבת המשתמש במבנה התראות חלונות רשת שזוכים להכרות דרך משגרי פקודות שמקפצות על הלקוח בדמות התראה שעונה למילה מסוג של ← `alert()`.

**המשימה הושלמה כאשר**
- [ ] ניכר בבדיקה כי מבנה בניין הפלט למסך עמוד הפרויקט (The page) לוקח לעצמו את כלל מושכות הקיום במעשי שימוש חוקי לאורך השימוש באוצר מילון רצף חלקי הפעלת תגיות בסיווג מושלם שמציג תגית פתיח עליונה תחת `header`, אזור מערך עמודת עבודה לליבה בנקודת ה-`main`, חלוקת בניין לחטיבות סדרי הופעת שדות תחת משטר ה-`section`, הכללת מסגרות הצגת אזורי רשומות כליבת כתבות תוכן לאזורי כרטיסים כדוגמת בניית מבנה `article`, גבולות איחוד סרטי הרכבות לעולמות של מתקני כתיבת משתמש במתחם מסד תפקידי טפסי הפעלה בידי אלמנט של `form` וכן מסד שילוט צימוד שילוטים על מסגרות השדות להוראות עבודה במבנה הגדרות של ה-`label` בעבורן ממש כשם ובהקפדה שסעיף חוקי המבנה בדקדוקיו הראשיים כמו שמצוין מול כללי נספחי ההוראות בנספחי צורכי משימות §10 מבקשים בתכלית ומתחייבים אל מול עיצוב נאות בדרישות הפיתוח הנהוג בקו העקרונות שדרוש מן היוצר ודורש להן ברצינות (requires), כמו כן נתון שמרקם תשתית הברזל במערך שפת עיצוב שלדי הקוד בצורת מתווי מבנה המסמכים היררכי שבסוגת קטעי הכתיבה החשופים בקובץ השורות של הבסיס על HTML נבדק ונמצא ללא עוררין בדרגת איכות סמנטית שהוכיחה תעודת איכות על ציון תקין לחלוטין וללא שגיאות על תוואי המסלול שמוצדק ומציב סטטוס תקינות מקצועית שלמה בסיווג חיווי אות כגון אכיפת דרך ה-valid (כשכוונתנו בסיווג חסר ליקויים מוכוונת לוודא אי קיומן של אף שום מצגות על תגי פקודות זולגות שאינן ניחנו בסיומת סגירה ראויה כחוק על דרך כגון unclosed או לחלופין המנעות טוטאלית במאמצים למנוע לחלוטין שיבושים מסוג חשיפות לצורות של הלחמות עטיפה נגועות בפגיעות הרכבות קינון מוטעה ומקולקל בקוד בממד שצייר וסיבך תגיות בהיררכיית בניין פנימית במתאר חלל השכבות הפגום שעלול לאפיין את סוג עיוות המיקומים בהחלת שגיאות בדרכי הופעה רשלניות מהזן כמו misnested tags).

### משימה 10.2: מערכת עיצוב (`style.css`)

**קבצים:** `client/style.css` (עריכה) · **מפרט:** §9, §10

**צעדים**
1. הגדר אסימוני עיצוב (design tokens) בתור מאפייני CSS מותאמים אישית (custom properties): משתני צבעים, ריווח (spacing), רדיוס גבולות (radii) והצללות (shadows).
2. בנה כרטיס אימות בעיצוב זכוכית (glassmorphic auth card): רקע שקוף למחצה, החלת מסנן לטשטוש רקע מאחור כגון `backdrop-filter: blur(...)` ומסגרת (border) עדינה ורכה.
3. פרוס את העמוד באמצעות מנגנון CSS Grid (בכדי לנהל את אזורי הדשבורד וכן למערכת רשת הכרטיסים - card grid) ואף הוסף כלים ממנגנוני פריסה המאפשרים גמישות כגון ה-Flexbox (אשר מיועדים ליישום על רכיבי הטפסים, חלק עליון של כותרת הדף - header, וכן שורות להעמדת הכפתורים המרובים).
4. עצב וסגנן את המרכיבים (components) במערכת: כפתורים בהבחנה (ראשוניים, כפתורי סכנה, וכפתורי "רוח" שקופים), תגי זיהוי לתפקידים שונים (צבע מיוחד וייחודי לכל תפקיד), כרטיסים, הודעות פנימיות בתוך הטקסט (error and info), שורות אישור להודעות משוב פנימי (inline confirmation rows), לצד עזר מחלקת עיצוב פשוט שישמש לתכונת ההסתרות תחת מנגנון ה-`.hidden`.
5. השתמש בנקודות שבירה לתצוגה שמתחילות קודם כל ולפני הכל במכשירים הניידים (mobile-first breakpoints כהוראת §10):
   ```css
   /* Mobile (≤ 600px): base styles, no media query */
   @media (min-width: 601px) and (max-width: 1024px) { /* tablet */ }
   @media (min-width: 1025px) { /* desktop */ }
   ```

**המשימה הושלמה כאשר**
- [ ] מסך ההתחברות ולוח בקרה במצב ריק נראים באופן הולם ותקין לגמרי במידות רוחב המסכים: 375, 768 וב-1280 פיקסלים.

### משימה 10.3: ערוץ לקוח ה-API ומחזור חייה של חותמת הטוקן

**קבצים:** `client/script.js` (עריכה, שכבת ה-DOM) · **מפרט:** §7

**צעדים**
1. החזק ושמור את מפתח הטוקן (token) בזיכרון בתוך משתנה בלבד: במבנה `let authToken = null;` וכמו כן משתנה למידע על הנוכח כעת בסגנון `let currentUser = null;`.
2. יצירת הפקודה לביצוע שיחות שרת כגון העברת הודעות עם `apiFetch(path, { method, body })` במטרה שתוסיף כותרות בקשה המודיעות על פורמט התוכן במבנה של `Content-Type: application/json` וכן מצהירה על חתימת ההזדהות של הנתיב בהעמדת `Authorization: Bearer <token>`, לצד יכולות המרה לפענוח נתוני JSON, והפיכת תשובות סוררות בעלות קודים שאינן סדרה מתואמת למענה תקני מקבוצת ה-2xx לניהול ודיווחי שגיאות אשר כוללות ונושאות את מסרי השגיאה המקוריים שסופקו מתוך שרת המקור בפורמט ההודעה `{ error }`.
3. בכל קבלת תשובה החוזרת ומציינת חסימת אישור בכשל בסגנון הודעות אבטחה כגון `401`, נקה לחלוטין את הטוקן ומחק את נתוני המשתמש, ובמקומם פתח והצג בחזרה את מסך הגישה בהתחברות (login screen) בתוספת ציון להודעת פירוט לאזהרה אודות אופי התקלה.
4. פעולת יציאה (Logout) מנקה את שני המשתנים ומציגה את מסך ההתחברות במלואו.

**המשימה הושלמה כאשר**
- [ ] לא מופיע כל שימוש באף מנגנון ושירות ממשק ייעודי מתוך טכנולוגיות השמירה (storage API) השייכות לדפדפן (כדוגמת `localStorage`, `sessionStorage`, או קוד משירותי `document.cookie`) באף מקום בתוך רחבי סביבת תיקיות ה-`client/`.
- [ ] רענון פשוט לעמוד האתר שולח את המשתמש חזרה למסך הכניסה ההתחלתי (AUTH-05, בחלק מבדקי ה-UI).

### משימה 10.4: זרימת תהליכי התחברות (Login) וכן קווי יצירת רישום עובדים למערכת (register flows)

**קבצים:** `client/script.js` (עריכה, שכבת ה-DOM) · **מפרט:** §6, §9

**צעדים**
1. אפשר מעבר ותחלופה חופשית בין כרטיסיית ההתחברות (Login) וכרטיסיית ההרשמה (Register).
2. בצע את אימות הקלט (Validate inline) לפני הליך השליחה: אורך שם מ-2 עד 50 תווים, הלימה לתבנית הטלפון (phone pattern), וסיסמה באורך של לפחות 4 תווים בסיסיים.
3. במקרה של הצלחה, שמור את אסימון ההתחברות (token) בזיכרון, מלא את נתוני הכותרת העליונה (שם ותג תפקיד), הסתר את אלמנט הממשק `#auth` והצג את רכיבי המערך של `#dashboard`.
4. הצג שגיאות מצד השרת כהודעות פנימיות בטקסט: `409` (שם כבר תפוס), `401` (כשל התחברות כללי) או קבלת החלטת מנגנוני ה-`400` (כללי סירוב חוקי השדות העקרוניים במערכת).

**המשימה הושלמה כאשר**
- [ ] רישום, התחברות, ניתוק ופקיעת תוקף או הצגת טוקן לא חוקי כולם פועלים בדיוק כפי ש-§7 מתאר, ועבור כל שלשת התפקידים.

**שער שלב 10:** בדוק ידנית את תהליכי העבודה בתור נציג לכל תפקיד: הירשם כמשתמש חדש, התחבר פנימה, צפה בתג המאשר את שם תפקידך, ולבסוף התנתק מן המערכת. רשום את התוצאות ביומן הרישום.

---

## שלב 11: לוח בקרה לאימונים (Sessions Dashboard)

**מטרה:** תכונות ופונקציונליות בשימוש יומיומי. המשתמשים מוסיפים, צופים, עורכים, מוחקים, מסננים וממיינים את האימונים שלהם, וכמו כן הסטטיסטיקות והתובנות (insights) אמורים להתעדכן מיידית לאחר כל שינוי.

### משימה 11.1: מנגנון פקודות לטעינת נתונים והרצת הזרמת תהליך פריסת הרינדור לעדכוני מסך התצוגה במערכת (Data loading and render pipeline)

**קבצים:** `client/script.js` (עריכה) · **מפרט:** §2.2, §9

**צעדים**
1. לאחר סיום מוצלח בפעולת התחברות, טען פנימה את המידע:
   - קטלוג התרגילים (`GET /api/trainings`);
   - את רשימת אפשרויות קבוצות השריר השונות בעזרת הפקודה אל נקודת היעד הרלוונטית לכך (`GET /api/options/muscle-groups`);
   - אימונים (sessions). מנהלי אדמינים או סופר-אדמינים משתמשים בכלי הנתיב שממוקם בסביבת `GET /api/users` ומרדדים אל מערך אחד פשוט ללא כל השכבות (flatten) במשותף את כלל האימונים של עולמות המשתמשים כולם, ומתייגים בעבור כל רשומת רצף בנפרד ציון נספח מתאם של הקוד המזהה במשתנה השמור לבעלים בייצוג של `ownerId` במקביל למילוי טקסט עבור רישומי הערך הקורא והנשלט לציון העדות תחת חותם של פרטיי השם בסגנון `ownerName`. משתמשים רגילים לעומתם ייגשו למידע בהרצת נתיב הקריאה שמצומצמת להם בהיקף של גישה עצמאית אל משאב פרטני כדוגמת השם של נתיב במקום כמו ה-`GET /api/users/:userId`.
2. שמור על אובייקט מצב הלקוח היחיד וכן פונקציית `renderDashboard()` אחת אשר מרנדרת מחדש מתוכו את הרשימה, הנתונים הסטטיסטיים והתובנות. קרא לה לאחר כל הוספה, עריכה או מחיקה.

**המשימה הושלמה כאשר**
- [ ] כל תפקיד צופה בהיקף הנכון לו: אדמינים וסופר-אדמינים רואים את האימונים של כולם, ומשתמשים רואים רק את שלהם.

### משימה 11.2: טופס הוספת אימון

**קבצים:** `client/index.html`, `client/script.js` (עריכה) · **מפרט:** §9

**צעדים**
1. אלמנט הבחירה (Type `<select>`) משנה ומסנן את תפריט בחירת התרגיל (Exercise `<select>`) כדי להציג רק פריטים מקטלוג התרגילים המתאימים לסוג הפעילות הזה.
2. שדות האירובי כוללים: זמן ריצה (duration), מהירות עם המאפיינים המוגבלים בהוראת תנאי (`max="15.5"`, `step="0.1"`), וכן הוספת כלי תפריט בחירות לאופציות בסרגל ההצגה למתחם הגדרות נתון רמות קושי כגון ה-`<select>` השמור על יחידת ההוראה של difficulty, נוסף לכל זאת אפשרויות הכוללות גורם משתנה משלב נתונים כעין הגדרות קו יציבה במישורים עם כוח הכרעת קצוות שמגיע תחת שדה בכינוי השפעה הנקרא כמו ה-**incline** שיוקצה לצורך התהלכות בהליכה יחד מול הגדרות במצבי ריצה או לחלופין בהפעלת הגדרות הקו השולט ביד רמה בעוצמות הכוח המתלוות לשדה התנגדות הנקרא גם כמצב **resistance** אשר מקובל לעולמות עבודת פריטי הקטלוג שסובבים מכשולים תחת אופניים ורכיבה (cycling), משטחי אליפטיקל ומסלולי שיט וחתירה (rowing), אך כל המאפיינים הללו אינם מיועדים למלא שום נתיב רישום עבור חריגים מסוג פריט ה-`other`.
3. שדות הכוח (Power) כוללים: בחירת שריר (muscle-group `<select>`) שבה אין אופציית "אחר…" (Other…), אלא היא נבחרת מראש לפי הקטלוג ומציגה את רשימת אפשרויות השריר בתוספת הערך מהקטלוג במידה והוא לא קיים כברירת מחדל ברשימה הכללית; בנוסף לשדות ხזרות (reps), סטים (sets) ומשקל.
4. שדה בחירת תאריך עם תכונת מקסימום (`max`) המוגבלת לתאריך של היום.
5. אמת בעזרת `validateSessionInput` והצג שגיאות ליד כל שדה בעייתי. לאחר מכן שלח משימת `POST` חדשה לשרת, רנדר מחדש, והצג כל שגיאת שרת כחיווי טקסט פנימי ישיר וצמוד.

**המשימה הושלמה כאשר**
- [ ] סעיפים UI-01, UI-03, ובדיקות התאימות בסיווג UI הקשורות ל-DM-04, עוברים בהצלחה במבחן התוצאה שלהם.

### משימה 11.3: כרטיסי אימונים

**קבצים:** `client/script.js`, `client/style.css` (עריכה) · **מפרט:** §3.5, §9

**צעדים**
1. רנדר כל אימון ככרטיס בתגית `<article>` שמראה רק את השדות המתאימים לסוג התרגיל המבוצע בו.
2. הענק לכל שדה ריק או הנושא ערך כפול של `null` את תגית מחלקת ההסתרה המורכבת תחת צירוף השם הנסתר מסוג ה-`.hidden`, לדוגמה הסתרת אלמנט השיפוע המהיר הקרוי משתנה בשם ה-`incline` בזמן שיווי משקל שמופעל על מעגלי אימון סביב רכיבת אופניים.
3. הצג את ניקוד העומס באימון בפירוש השייך בסעיף למונח ה-`effortScore`. במקרה של אדמינים וסופר אדמינים, הוסף והצג גם את השם של בעל האימון המקורי.
4. כאשר `calories` אינו `null`, הצג אותו בתור "≈ X kcal". ערך `null` מוסתר בעזרת צעד 2.

**המשימה הושלמה כאשר**
- [ ] שום כרטיס איננו מציג תווית ריקה או נתונים חסרי תוכן על פני המסך.
- [ ] UI-16 (חלק הכרטיסים) עובר: כרטיסים של אימונים שנרשמו כשהאפשרות **כלול שריפת קלוריות** מופעלת מציגים "≈ X kcal", ושום כרטיס אחר לא.

### משימה 11.4: עריכה ישירה ומחיקה מקוונת (Inline edit and inline delete)

**קבצים:** `client/script.js` (עריכה) · **מפרט:** §2.2, §9

**צעדים**
1. רנדר את כפתורי ה"עריכה" (Edit) וה"מחיקה" (Delete) רק כאשר יש הרשאה מלאה לכך לפי כללי §2.2: על אימוני המשתמש עצמו (בכל תפקיד), ועל כל אימון עבור תפקיד סופר אדמין.
2. עריכה משנה את שדות הכרטיס לשדות טופס של שדות הזנה (`inputs` ו-`<select>`), כולל פונקציונליות השמירה הכרוכה בכפתור ה-Save (על בסיס פעולת שרת מסוג `PUT`) יחד עם מקש של תהליך הביטול לטופס בכפתור Cancel. נתוני בסיס אודות קביעת זיהוי רצפי האפיון בסוגת משתנה ה-`type` ומנגד בהגדרת הפעולה בנתון ה-`activity` יישארו ויקובעו כמו במקור לקריאה בלבד (read-only).
3. פעולת ה"מחיקה" מציגה אישור צמוד בתוך הכרטיס גופו עצמו ("האם למחוק אימון זה? [כן] [לא]"), ובשום פנים לא תשתמש בחלונות מאשרים של התראת פקודת רשת דפדפנים כדוגמת הסייג שנכלל על פקודה של צורת התראה דרך הודעה כעין `confirm()`.
4. שגיאות מופיעות באופן מקוון (inline) על גבי הכרטיס עצמו.

**המשימה הושלמה כאשר**
- [ ] בדיקות סעיף UI-12 יחד למבדק המעיד במקרים השייכים בחלקי UI כדוגמת הבחינה מסוג מערך ה-RBAC-06 עוברים ומאושרים במבחן, וכאשר אדמין לא רואה כפתורי עריכה או מחיקה בכרטיסים של משתמשים אחרים.

### משימה 11.5: סרגל סינון, חיפוש ומיון תצוגות (Filter, search and sort bar)

**קבצים:** `client/index.html`, `client/script.js` (עריכה) · **מפרט:** §9

**צעדים**
1. סינונים:
   - בחירת סוג אימון (`Type` בתגית `<select>`): כולם (All), כוח (Power), אירובי (Aerobic);
   - תפריט קבוצות שריר (ב-`<select>`): כולם, רשימת אפשרויות קבוצות השריר, וכל ערכי המשתמש המותאמים אישית (custom values) שנמצאו בנתונים העדכניים. נטרל מנגנון זה והתעלם מהפעלתו אם נבחרה קטגוריית פעילות מסוג אירובי (Aerobic);
   - שדה הקלדה עבור אופציית עזר לפקודת עבודה איתור וסימון בשדה במנגנוני החיפוש בהטמעת טקסט כבקשת נתוני העבודה לשלבי חקר אל מסגרת השמות במסגרת משימת הבחירה החופשית שמצויה תחת צורת שדה ה-name search input.
2. תהליכי ארגון המיון למשתמש בסדר (Sorting): משתמש לבחירת מפתח (sort-key ב-`<select>` הכולל: תאריך, שם משתמש, ציון מאמץ מחושב) וכמו כן תכונת מתג כיוון מיון לסדר (מעבר קל בין תצורה עבור עליות משתנים המסווגות כאופי תנועה מדורגת עולה או הגדרת נתוני השתקפות על הלוח לתנודת המדרגה בצעד צלילה אל המידות למבנה מתאר סדר הצנחת הרמות במדרג שיורד - ascending or descending).
3. כל אירוע הדפסה בקלט (`input`) או בחירת שינוי (`change`) גורר אוטומטית הרצת פעולה למנוע הסינון בסגנון השם `filterSessions`, ורק לאחר מכן מחיל סידור למסד ביצוע הפקודה אל המיון כגון העברת משתנים בטיפול המסדר שב-`sortSessions`, והפעלה מחדש למערך תצוגת התמונה הכללית של אלמנטי נראות הכוללים הדפסת הדף ורינדור הרקע, כל זאת יחדיו בתהליכים מידיים אשר מבוצעים תוך שיקוף הדדי בניהול זמנים המעודכנים למשתמש המדגים עדכונים המשפיעים בזמן אמת עכשיו.

**המשימה הושלמה כאשר**
- [ ] בוחן מסוג שורת האפיון לבדיקת מקרי כשל ודרישות עיצוב שמקוטלג ומאובחן במבחנים של המערכת כהוראת התקינות המוכרת במספר הידוע בענף לסימול כקוד UI-11, מאומת ואף פועל ועובר לחלוטין.

### משימה 11.6: פאנל תצוגת נתונים סטטיסטיים ושילוב מנגנון תובנות עמוקות מבוסס מערכת (Stats and insights panels)

**קבצים:** `client/index.html`, `client/script.js` (עריכה) · **מפרט:** §9

**צעדים**
1. העמד תצוגה מורחבת על גבי קו המאפיין הכולל מספר חלוקות בפיזור ושרטוט אל ארבעה חלקים המאגדים מרובע שנושא עליו מעמדי עיצוב כרטיסי מידע מעוצבים שיציגו משדרים סטטיסטיים שיגיעו מנתחי השדר הבנוי במסד הדו"חות המחושבים בניהול מרכזי המיוצא מפונקציית מערך ניהול הפלט של הערכה בפעולת הניקוד בתהליכי המיון ב-`computeStats`. מרכז המידע שבכרטיס הראשון יציג קריאה באותיות ברורות את התיאור האמתי עבור נראות למעמד אוכלוסיית ההנהלה בהם "סך כל המשתמשים הכללי" לציון המספר המעודכן בעד כוח הפעולה של בעלי הסמכויות מהענף בסוג אדמינים או מקביל להם בכליל כוחות הפעלת צמרת שכוללת גם את בעלי הסמכות כמו אלו השמורים למלוא המידות בסיווג רחב כחוק עבור מקבץ רמות השייכות לחברים בתת תפקיד של מפקחי על בשכבת השליטה בארגון במבנה המוכר כמשפחת דרג הסופר-אדמינים ויחד על נספח שונה לחלוטין שמכוון לעניין לקוחות סטנדרטיים ברמת שירות פנימית שבה ההדפסה תרשום את סך מיצוי הערך הרגיל והאישי תחת צג החיווי הכולל מידע אודות סכימת מצבור המסה במסר המופנה לאדם בודד על ערך מאזן המשקל תחת משפחת הערכים המבשרת בהגדרת קו החשבון שלו כ-**כלל סכום כל יחידות מדדי אימונים כפי שיצאו מהעבודה הכללית שלי**.
2. הצג בחלון תצוגה ייעודי רשימת תובנות שמשוחררת מהרכבתה וצרופה בידי הפעלת עבודות מחקר שמסתכמות בעזרת פלט של מנגנוני המיון התשתיתיים במערכת ההמחרה שזכו לאות בשם פונקציית המסע של שחזור היסטורית המסקנות במרחבי תחשיב מדדי ההמלצות המרכזי ששולב דרך `buildInsights`.
3. בצע מהלכי תקינות של ריענון מחודש תדיר לשני הקבוצות (גם הסטטיסטיקות וגם התובנות) כחלק מפונקציונליות השתלבות תדירה הנמשכת בסדירות שוטפת שמשגרת עדכוני חזית צפייה על פני גוף האזור למשימות הבנוי שמפגין סיוע שירותים בפקודת שרטוט מחדש להזנת וציור גבולות מתאר מעבר עבודת לוחות המחוונים שמשתקף בסעיף שזור בתוצאות במערכת ההכוונה הקרויה במנועי הגרפיקה במערך ששמו הנודע כמו `renderDashboard()`, כדי שהם יעקבו באדיקות אחרי כל מופע שינוי שמתעדכן בנתונים.

**המשימה הושלמה כאשר**
- [ ] בדיקות מסוג סיווג נתוני UI-13 צלחו ואושרו במעבר מופתי, כולל במקרה הקיצוני בו מדובר במשתמש חדש וטרי לחלוטין ללא שום היסטוריה של אימונים שנרשמו בקופה.

**שער שלב 11:** בצע הרצה ועבור ידנית על תכונות האימונים דרך המסך תוך בדיקת התנסות בפונקציונליות ככל אחד מהתפקידים הקיימים. רשום וכתוב את המסרים שעולים והשתקפו תחת אודות תוצאות המבדק ביומן הפרויקט במדויק ופרטנית.

---

## שלב 12: קטלוג וממשק ניהול (Catalog & Administration UI)

**מטרה:** יצירת פאנלים לניהול הקטלוג יחד עם זרימת עבודה מתואמת המיועדת להתאמת "Other…" (אחר) במסך בחירות שריר, ניהול ויצירת רישומי משתמשים חדשים, וכמובן מסכי מחיקת רשומות חברים. כל תצוגה ואלמנט מותנית לאישור הגישה ומוצגת אך ורק לדרג המסוגל ורשאי לפי היתר אדוק להשתמש בה בלבד.

### משימה 12.1: רשימת תצוגת הקטלוג (Catalog list)

**קבצים:** `client/index.html`, `client/script.js` (עריכה) · **מפרט:** §2.2, §3.5, §9

**צעדים**
1. סדר וערוך הצגה רציפה המכילה בתוכה מתאר נתונים כרשימה של כל יחידת תרגיל שמלווה בציון מסווגיו כגון: סוג (type), שם ייעודי המשתייך אליו בסימול כמו (name), ואפיון פרטי פעילות הפעלות נבחרת יחד בשילוב מאפייני יחידות במערך הקרוי עבור מופעי סוג הכוח תחת איחוד מקבץ איבר המהווה את חלק קבוצת השריר הרצויה. סמן תרגילים אירוביים שבהם האפשרות **כלול שריפת קלוריות** מופעלת, למשל בתג קטן עם הכיתוב "kcal".
2. שכבת המנהלים המסווגים ככוח עבודה בתפקיד ה-אדמינים ובנוסף לחסות שדרת הנהלת העל בארגון המוגדרת בשם מועדף של כוח הניהול העליון בסביבת פתיחת עמדות המורכבות בסופר-אדמינים יקבלו לעיניהם כפתור ייעודי שיופעל עבור ביצוע שינוי מתוך סגנון ה-עריכה (Edit button). בלעדיות מתן גישה שמורה לסופר אדמינים תופקד בעוצמה שימושית למחיקה שתחזיק היתרים לתצוגת הצבת כפתור שמעמיד אפשרות סילוק עתידי עבור אלמנט הרחקת נתון (Delete button), בליווי הגשה צמודה למתן כניסת הודעת מסך מחייבת המופיעה בעמוד במקור ומאגדת הבעת צורך קטן למתן הוכחה משמעותית של הודעת ביטחון המספקת קו חיווי של טקסט בתוך המסך ללא הקפצת חלון חוסם המבקש אישור פנימי. קהל החברים בסיווג עובדים רגילים מן המניין יזכו להיחשף לגרסת תצוגה במצב של קריאה בלבד ללא שום הרשאות נגישות אחרת.

**המשימה הושלמה כאשר**
- [ ] בוחני תקן על הרשאות במבדק הידוע בקוד הסיווג כגון RBAC-04 (בחלק תצוגת UI) חלף אישורים בניצחון חלק: משתמש פשוט לא מקבל ראות מצד כל אפשרות המובילה לאימוץ גישה דרך עיון והבחנה בלחצני חלונות ה-Edit בעמוד התצוגה המעניק מתן הרשאת התעסקות בסרגל הפנימי בעת צפייה בקטלוג הנתונים המשותף.

### משימה 12.2: טופס הוספה/עריכה למערך התרגילים

**קבצים:** `client/index.html`, `client/script.js` (עריכה) · **מפרט:** §3.5, §9

**צעדים**
1. רשימת השדות:
   - מאפיין Type (סוג): תיבת רשימה על גבי תגית עזר בעלת טבלת אפשרויות למסד תכנים נגזרים כמו מבנה פריט עזר מסוג בחירה של בחירת אלמנט הנשלט בכוחן של תיבות פקודות בשם ה-`<select>`, שננעלת כמערכת של קריאה בלבד כאשר הדף ניצב למטרת חלונות התצוגה המוכנים מבעוד מועד למען ביצוע פעולת שדרוג בתצוגת העריכה עצמה.
   - מאפיין Name (שם): תיבת כתיבה חופשית שאינה מגבילה.
   - מאפיין ה-Activity (סיווג פעילות אירובית): מרכיב של מערכת כלים מסוג תיבת סרגל לבחירה מתוך צג הבחירות המוגבל ב-`<select>`, שיוצג רק כאשר בוחרים בפעילות מסוג של עבודות האירובי בלבד.
   - כלול שריפת קלוריות (Include calorie burn): תיבת סימון `<input type="checkbox">`, מוצגת לאירובי בלבד (§3.5). אינה מסומנת כברירת מחדל. החלפת הסוג לכוח מסתירה אותה ומבטלת את הסימון.
   - קבוצת שריר: גורם שדה לבחירה שנוצר באמצעות קריאה חיווטית לכוח מחולל כזה שמקיים סיוע עם הצבת תהליכי הפקה כנגזרת שמקורה ביישום ערוך במוצג מתוך החלק הזה שמציג את פריט מערכי מילות המאגרים בבחינת `buildMuscleGroupOptions(list, { withOther: true })`, ויוצג במגרש כחלק מסרגל נתונים להכללה בפלט אך ורק באימונים תחת מאפיין שנושא את משפחות כוח האימונים בביטוי מעשי לפעילויות התואמות (Power) כראוי.
2. בחירה קבילה ממוקדת והשלמה מתוך מאגר במשתנה אופי קצה שנשא על דגלו פתיחת אפיק צפייה של חלופה השייכת בסעיף המלל שמורה על הגדרות רזרבה והעדפה פנימית בכיתוב החריג והמרוחק על מצב ה- **"אחר…" (Other…)** תגלה מידית מסגרת להזנת המשתמש בתוך שדה למילוי המצריך פניית הכנסה כפלט כתיבת מחרוזת טקסט חיוני שיצוף קרוב מתחת לפתיחת חלונות תחת תיבת תפריט פקודות הבחירה, ויעבור אכיפת מניעה לאימות והצגת תקלה מחושבת על קו משטחי המסלולים באופן נוכח ומיידי (validated inline). כל הזנת שדה חורג ממדד המותר שחורג מאותיות סטנדרטיות הנהוגות ככתב קריא על משקל הדפסת תקן במערכות המילון האנגלי, רווחים או מקפים יציג מראה מייעץ המעיד בדחיפות הודעת אכיפה שמזכירה בחומרה כי עליך לשנות תוכן קלדנות בהעדפה שתתייחס ללשון "השתמש באותיות באנגלית בלבד" (Use English letters only.). בחירה באפשרות כלשהי אחרת מתוך תיבת הגלילה פשוט מחביאה וגם מנקה לחלוטין קלט ישן שעמד להיות מוכן בשדה הנ"ל.
3. אפשרות לחלון קו לעריכה משדרת חזרת קופסת הצצה שנפתחת עם אותו משטח תצורת לוח עבודה במצב שימור שמשחזר ומאכלס אוטומטית שדות שכבר מולאו נתונים בעבר. במקרה וישות ענף סעיף שייך כקבוצת שריר בתרגיל הנוכחי כלל איננה מזוהה תחת כניסה רשמית הקיימת באופן מוסדר ומצוי במבנה העזרים של הרשימה, המערכת תיבחר באופן החלטתי אוטומטי בהכרעת בחירה וגילוי סיוע פתוח לטובת מזהה של אפשרות בשם ההעדפה **"Other…"** בלוויית הכנסת הזנת תוספת התוכן האמתי בפנים באופן גלוי לעין הטקסט עצמו אל מרכז כוונת העניין באופן שישלים. תיבת הסימון מציגה את ערך ה-`includeCalories` השמור.
4. השמירה מבצעת שליחת משדר איתות בבניית הוראות העברה בקשר שיגור תוכן לבקשה הממוקדת לקו השירות בכיווני `POST` כשמשלבים מידע חדש בהקמה, ובקשת ניתוב החלפות נתונים לפרוטוקול כפי הגדרת חוק שמבקר במסלול הגישור של כתובת ה-`PUT /api/trainings/:id` בעת עריכה של משתנים קיימים במאגר. הצג שגיאות מצד מערכות שרת פגוע כפלט שידור תופת מידית קוית על העמוד הנוכחי במסך (inline). בתרגילים אירוביים נשלח גם `includeCalories` כבוליאני של JSON.

**המשימה הושלמה כאשר**
- [ ] שורות מבחני ההפעלה בסיווג UI-04, וכן מבדק הנספח בתחום תצוגת UI כגון UI-05, לצד שורת המבחן של פקודת מבחנים תחת UI-09 וכן עמידה בקריאת האבחון של מבחני עמדות השירות העיקרי למתאר ה-UI-10 עברו כולן פסיעה אל נמל ההצלחה בניצחון ברוח אישור חלקה וצדקו בעמידתן.
- [ ] UI-16 (חלק הטופס) ו-RBAC-10 (חלק ה-UI) עוברים: רק אדמינים וסופר-אדמינים רואים את הטופס, ותיבת הסימון מופיעה רק עבור תרגילים אירוביים.

### משימה 12.3: זרימת תהליך מסך השילוב המוסדר של רשימה משותפת לאחר השמירה במידע מקוון (Shared-list flow after save)

**קבצים:** `client/script.js` (עריכה) · **מפרט:** §9

**צעדים**
1. לאחר רישום שמירת יעד ממוקדת של מאגר נתונים שתועדה במסר קבלה שהוגדר ועבר באופן התחברותי כהישג **מוצלח** (successful), הרץ מנגנון משלוח פקודה לעיבוד מערכת בחתימה המצייתת לחוקי פעולות מחשבי הבדיקה והכנה שבשם ה-`resolveMuscleGroupInput`. במידה ומילות ההזנה המוקלדות מצטלבות ועונות להתאמה זהה של כפילות הקיימת באפשרות זמינה במסלול רשימת המערך, אופציה זו תוצמד לבחירה הרשמית בעצמה ושום הודעת תקלה אחרת איננה תקרום עור וגידים ותעלה משום אובדן כיוון נוסף.
2. אדמין המבצע הכנסת עבודה אל תוך המאגר ומפקיד בו שינוי של הצמדת סיווג צבירת ערך חריג מהזן התוכן החדש כשלעצמו יתקל בקבלת מצג של קבלת עדות הודעה פנימית (inline note) אודות הערה מצד ההנהלה יחד על פסיחה מוחלטת להנמנע מהוצאת מציאות הודעת עמדת הזמנה לאישור נוסף בהתראה כמעין בקשת (prompt): המערכת תשדר לו כי התוכן במערך העבודות *"נשמר עבור התרגיל הזה בלבד. רק מנהל-על (Super Admin) מסוגל להוסיף זאת באמת לרשימה המשותפת כולה."*
3. כאשר מנהל עליון (superadmin) מכניס לתוך המערכת מידע המשמר שיפור נתון ערך חדש (שמוכח ומפוענח באמצעות פעולות הכלים במונח ה-`shouldOfferAddToList`) הוא נתקל בהצגת דיווח שמגלה משטח הודעת ביקורת בקשה ערוכה לפעולה המוצג בקפיצה מובנית למסך פנימי קרוב למקטעי שורת עטיפת המסגרות בטופס. שומה עליו לאשר כי מסגרת תגית אזהרת תצוגת הבקשה מוכרחת להתבסס בפועל ובמציאות רק מן הצד של גוף אובייקטיבי תוכנתי ברוח הרכבה פנימית שמגיעה דרך בניית מתכונות תגיות גופי המארז במבנה ה-DOM הממוקמים שם בשלמות, ושמירת איסור הרחקת השימוש בסתם חלונות מהירי הודעות מערכת המציקים של קוד דפדפן אזהרה קבוע שנכפה תחת מערכת בסגנון של חלון `confirm()`: ואז יקרא על מופע הבמה *"האם תרצה להוסיף את הערך **forearms** אל רשימת אפשרויות קבוצות השריר לשימוש עתידי? [כן] [לא]"*
   - בלחיצה מצידו על כפתור התנאי המאשר כ-**כן:** קרא והעבר שליחת צפי מסרים אודות תיאום אל נקודת תיווך השרתים תחת מיפוי אל מחוז ה-`POST /api/options/muscle-groups`, רענן בשנית בטעינת מסכים את פרטי הרשימה, ובנה ורנדר מחדש בתוכנה את **כל** תיבת אפשרות בחירה שמגלמת הגשת אופי איתור שיוך שריר מסוג החלק של נתוני השלמת תיבת בחירות שנקראות (muscle-group `<select>`): רענון כזה נצרך לעבור במיפוי על אזור הכנסת הטפסים להגשת פרטי תרגילים (exercise form), להביא עדכון גם על חלל הכרטיסיות לניהול תזמון הופעת משמרות הטפסים שמחזיקות באימונים עצמם (session form), ועד לסרגל מנוע הסינון ובשאר מקומות כמשטחי חלוניות הפקודה לעריכה שמתרחשים בדיווחים על שורות העבודה יחדיו פנימה בחלקת הרשומות המקוונות עצמן.
   - במידה ונעשתה דחייה וסירב בלחיצה על כפתור האומר כ-**לא:** סגור את הודעת החלונית השומרת כעת אל מול האזהרה (ה-prompt). הערך החדש פשוט נותר כמות שהוא ללא כניסה לנמל הבית וישרת צרכים השייכים בסמוך לסביבת התרגיל הבודד המקומי הזה בלבד.

**המשימה הושלמה כאשר**
- [ ] מקרה מבדקי החוויה ממשק על הלקוח מסוגל להוכיח וירוק לעבור מבחנים העולים בקודים בממדים מתוך השורות החלוצות שפירטו על עולם ה-UI-06, נתמכו בקנה מידה זהה והצלחת מסלול עבור שלבי נגישות שמעניקים יסודות מתוך אזורים של רכבי בדיקת השדות כקריאת מנועי סיכום אל הגדרות בוחני מקומות ה-UI-07 (שכוללים אגב כעניין שבשגרה היתכנות על מעקב למציאות הדרישות שמגיע לאישור רק גם לאחר עזיבה במרחבי יציאה בטעינת מחדש במסך - reload, ואף כניסות חידוש הופעת מערכת לאחר כניסה בהתחברות טרייה מהסביבה מתוך משדר איתור למנהל הרשאות ממקום חדש), ובמקביל לאישור חוקות בטיחות שנעות מתחת פסי צירי בדיקה אחרונה אל יסוד ממסמך ה-UI-08 ומוכיחות צלחת מעבר וסיום.

### משימה 12.4: טופס ניהול הקמת כרטיסיות לממשק משתמשים בעמדת עבודה (Create User form)

**קבצים:** `client/index.html`, `client/script.js` (עריכה) · **מפרט:** §2.2, §9

**צעדים**
1. אך ורק בעלי יכולות ההרשאה החזקות מסוג הדרגים במעמד אדמינים או מקביל להם מפקחים בשם מעמד סופר-אדמינים חשופים לראות את מבנה הטופס בעיניהם: שם, שדה הכנסת מידות קשר למונחי מספר טלפון, הכנסות אישור מודעי מיגון לסביבת קו תיבות לרישום סיסמה מבוקרת (password) ומבחר לוח סרגל תפקיד שמשתקף באובייקט גלילת נתונים במעמד בחירות שמוכר כסוגת `<select>` השמור לייעוד סוג רכישת תפקיד עבודה חדש (role).
2. חלוקת תפריט אופציות התפקיד מותנית ומיועדת להיגזר כפועל יוצא בעליל בהסתמך אודות המשתמש אשר מבצע וצופה כעת באחריות על התהליך עצמו (the viewer): אדמינים רגילים יהיו נתונים ומורשים להציע וליצור מתמודדים מסוג עבודה של משתמשים פשוטים בתחתית דרגת כינוי ההעסקה תחת היסודות של מצבי תפקידי עזר הקרויים תחת המושג `user` וזהו אך ורק לבדו בלבד ללא שום היקפים ככלים נוספים; בשעה שבעלי ההרשאה ממנהלי עמדות הגובה ברשומות ממרחב קצוות ההסמכה שבאזור הניהול במערך העובדים שהוקמו על ידי דגלי ה-סופר-אדמינים יהנו לקבל חלופה משתלמת נרחבת הניגשת לבחור בין האופציות לשם צירופי מעמד עבור צמד היכלי נבחרת החל מאותו תחום מדובר ככל השאר שקרוי ה-`user` ביחד ולצידו הוספת הכלי החשוב לאפשרות מילוי הצגת גידול צוותי סגנות בהכנסת קווי משמשים עמיתים מדרג מופעי נתון הפעלת העוזר במשימה מטעם הגדרת ה-`admin`. האופציה האקסקלוסיבית השייכת אל עמדות האב בעמדות הכוח להציע ולברוא תפקיד מסוג `superadmin` הינה אינה אפשרית ומוגדרת כמופקעת מסל הכלים ללא הזמנות ואלמנט הענקה באופן חד משמעי ושרירותי שלעולם איננו קיים כמוצע לחלוטין.
3. סדר ועצב הופעות שגיאות ממחלקת החזרות קוד מהשרת במספרי `409`, כמוהו כשגיאות דחיות באישורי מעמד נגישות של `403` ואף מענות לדחייה מהזן במבנה לקויות של סוגי ה-`400` תחת מסרים מקוונים שעולים ויצופו קרוב ליד המקום ובסמוך ממש לפני הבעיות גופן בחוויה קרובה במסך התוצאה עצמה (inline). במקרה ויצא לפועל הליך של עבודת קבלה מלאה שנסתיימה ביציאת מעבר משדרת נתוני אישור מנצחת שעבדה היטב בהצלחה, רענן את תכולת בסיס המידע על אודות מערכי הנתונים של כל המשתמשים כחוק.

**המשימה הושלמה כאשר**
- [ ] בוחני סמנטיקת הרשאות מתוך סיווג בדיקות איכות השייכות בקטגוריה למסלול במבנה האכיפה מטעם כללי ה-RBAC-02 (כשמדובר אך ורק ביסוד החלקיק הדן ומקיים מבחני הרצת נתונים עבור ממשקי UI חלקלקים בתחום פני הראייה של אזור ה-UI part) מבצע את תפקידו ומקבל תו חותמת נטול רבב על העברת תאימות מקיפה (passes).

### משימה 12.5: מגרש לשכת הנהלת נתוני ומשתמשי המערכת (Users panel)

**קבצים:** `client/index.html`, `client/script.js` (עריכה) · **מפרט:** §2.2 (D-17)

**צעדים**
1. סדרת משתמשים בכירים מדרג האדמינים יחד וסופר-אדמינים מתבוננים בלוח נתונים משותף המציג מסך גלוי המכיל תצוגות של רשימת משתמשים רחבה הכוללת מידע צמוד: שמות פרטי חברים (name), תגית מזהה צבעונית המציגה אות למעמד בסיווג השיוך אל פני סביבת משתני אפיון הקבוצה בסיוג של ה-role badge, יחד בצירוף למניית סך הכולל של חישוב תדירות פריטי הפעילות תחת משמרות אימוניהם אשר מופיע ליד הכרטיס במעמד הצגת נתון של ה-session count.
2. רק לאנשי ההנהלה מהמעלה הראשונה (הסופר אדמינים המועטים) מוצמדת זכות ייחודית המוסיפה ומרכיבה נגיעה בסמוך אל כל אישיות אלמנט לחצן מבוקש המגלם אפשרות הדחה במילה ברורה כדוגמת "מחק" (Delete button), בליווי גורם כפוי על המסך שמבטיח אימות במתחם מסר אנושי קרוב הממתין ללא הקפצת חלון צדדי מציק בעזרת עזר הודעת אישור על גוף המסך, שמופיעה בתצורה ישירה בנתיב המיועד (inline confirmation), כאשר תכונה זאת עומדת על כל פינה ושורה אך כמובן נעדרת מוחלטת מאזור מסלולם האישי ועל עמדות שמצביעות והוות שיוך לגבי הנתונים החוסים בצל שורתם הממוקדת שלהם בלבד עצמם אשר מופרשת בהגנה מההופעה כנגד מעשים מסוג פעולות קיצוניות.
3. באחריות סיום משלחי בקשת השמדה לצורכי מחיקה, דאג במכוון אל הרצת בקשות נתונים לעומסי ספיגת מידע שמוטענים ונשאבים מחדש לטעינת עדכונים חוזרים משלמות מהמאגר המרכזי שנותר חי (reload the data). הליך המחיקה המדובר פועל ומוביל לתופעות שרשרת בהן אימוני משמר השעות שצבר ועמדו עד עתה לטובתו של העוזב הספציפי והמשתמש המחוק יעלמו גם הם אל מעבר לעננים כלא היו ויימחקו מזירת מאגרי הרשימה המדוברת, ולצידם ייסוגו מהופעות בנתוני חישובי המערכת המשתקפים מעל ראשי הלוחות במסכי אשכול הסטטיסטיקות (the stats) ובסמוך לחלונות הפקת משפטי הידיעות למסכי ההשקפות מהמידע המתקבל כעזר שוטף (the insights).

**המשימה הושלמה כאשר**
- [ ] בוחני מערכות האבטחה המסווגים בקטגוריות הפרימיום במקבילות לקודי בדיקות כ-RBAC-08 (כששמים דגש ממוקד בחישובים החלים אל ממדי תוואי מבדקים מקומיים של החלק הנוכח במערכת על שדרת העברת מודל חזית הופעת התראות בצורות חלונות הממשק במעטפת למבחני החיווי המסתכמים כ-UI part) ואיתן סעיף הבחינה הנוקשה האחרון להרשאות בסיוג של ה-RBAC-09 עברו וחצו בהצלחה נכונה יחד בסיכום אישורים למען אכיפת תקינות עולמית למכלול סוגת שלוש משפחות התפקידים וכל שלבי הרישום במערכת בשלמותם.

**שער שלב 12:** בצע מנוסה חוזרת והרץ שלבי בדיקה ידנית סקירתית שמדלגת בצעדים מלווים לאורך סרגל עמדות ניהול חלונות קו הקטלוג ותכונות העזר הרבות לפעילויות האדמינים החוסים בשדרת ההנהלות מתוך כל כובע של נציגויות השירות מהתפקידים העומדים בחברת העובדים בתצורת אמת. הוכח מיומנויות תקינות ורשום את סך גילוי פני תוצאות הביקורת העדכניים לתוך דפי היומנים שפתחת מראש.

---

## שלב 13: QA (הבטחת איכות) וגימור צעדי המהלכים להגשת המוצר לביצועי מסירה (Delivery)

**מטרה:** להוכיח בודאות כי פרויקט זה עמד ומקיים ללא התפשרות באופן ניצח את כל חוקת ההוראות המוקפדות שמפורטות בתוך מסמכי הדרישות למערכת על כל כלל ופרט שבמפרט הבסיס (spec rule), למשוך תהליכי ארגון המעניקים חותמות אחרונים להשלמת מלל החובות במסמכים הפזורים בחלל העבודה שדורשים ליטוש תיעודי לפני שחרור (finish the documents), ולהביא אספקת מוצר מעולה שלם הכולל הכנת משלח לפקודת עבודה אל כיוון הקוד המסמל ציון דרך לפרויקטים בעולם התכנה בדמות יצירת הגשת מידע עתידי אל הזרמת פרויקט מעוצב בגרסאות בקשת משיכה (pull request) שמקרין יסודות של פיתוח נקי ומסודר שראוי לגאווה.

### משימה 13.1: הוכחת מידות הרצה מקיפה על פני בדיקות התאמה לקווי היכרות מסכי תצוגה בתאימות עולמית רספונסיבית לצד צרכי עמידה בקווי הנחיית מנגנון יכולת הגישה לבעלי מוגבלויות ללא עכבר ומקלדות בהנגשה (Responsive and accessibility pass)

**קבצים:** `client/style.css`, `client/index.html` (ערוך לפי מידת התקלות ולפי סעיפים שיעלו ויורו לשם תיקון וצורך ככל שידרש) · **מפרט:** §10, §14

**צעדים**
1. היעזר בשדה מתחם השליטה המיוחד בלוחות כלי הבקרה והעזר בפיתוח הציוד המיועדים מצד חלונות מערכות ההפעלה שבקצה התוכנית עבור מעצבי דפדפנים כמו סרגלי סרגל השירות העולמיים של מסכי מכשירים המסווג כמשטח סביבת האיתור על עולם כלי המעבדה כגון ה-DevTools device toolbar, וצלול מטה כדי למקם בקרות בדיקה קפדנית לאיתור התאמות רזולוציה בגדלי מידות החלונות במעברים מול נתונים שסובבים 375, עולה ל-768 ומעפיל ל-1280 פיקסלים: קבע הוכחה שתאשר ודאות על אי קיומן של אף תקלה שמביאה לחוויית גלילת העמודה הצידה מול חסימות אופקיות וצמיחתם של קווי גלילה בלתי חוקיים בעליל לממד הרוחב בסיווג כגון של גלישת רקעים מוגזמים המקוטלגים בבעיית horizontal scrolling, אי הופעת מריחת תוכן של רכיבי מראה שעולים אחד על פני רעהו בתכונות דורסניות המכונות במדויק בסיווגי התנגשויות תופעת ה-overlapping elements, והבטח במקביל שמירה הדוקה על משטחי טקסט ברורים מול תמונות עולם בהירות שמבטיחות מציאות חזותית בה ניתן לקרוא בשטף ומקרוב במובהק כל פרט אודות תיבות תוכן נתוני הכרטיסים לצד חומרי קלט מטפסים ומרקמי הטפסים השונים.
2. הגבל שימושים בשיטוט בעמוד באמצעות אילוץ והישענות אופרטיבית בתפעול הפעלת המקלדת הפיזית בלבד (keyboard only): הוכח כי לכל בקר כפתור שליטה קיימת נוכחות שמפגינה דרך עצמאית לגישה ויכולת ניתוב זמינה הנשענת רק בידי שיטוט כוח הקלדת מקשי המעבר במערכת אל לחצן Tab, וראה בעצמך שכל התאקלמות וזינוק עליה מוצגים מיד בהפקת חותם הדגשת כלי מראה יסודי בולט ומכוון כאינדיקציה לחוויה מוצלחת שעונה להגדרה של סגנון תצוגת צומת בהתמקדות המסמנת סביבת בחירה פעילה (visible focus style).
3. וודא ואשר בעובדה איתנה על ראיה קיימת כי כלל יחידות חלוניות הכנסת החומר בעמדות קלט הטפסים (input) מחזיקות ולוכדות נוכחות מארז בעלת עזר המוגדר מלווה עם תגית ייצוג כותרת שמירה על השדה מתוך כיתוב מקומי בשם התבנית בעלת קצה ← `<label>`, והוסף מבט נוסף למען וידוא נצחי והשגחת סרק שתבטיח קיום של עובדת שימור אופי צלול כבסיס שעליו סעיפי כתב הטקסט על אודות אזור המסמך נשמרים כמשוחררים בעלי מראה בהיר שעומד קריא בעמידות מצוינת למראה נוח וחלק אל מול הופעת תמיכת רכיבי הרקע החלקלקים בציפוי הזכוכיתי שמהווים אבן צורת הבסיס של התוכנה.

**המשימה הושלמה כאשר**
- [ ] בוחן התקינות הנדרש עבור העברת ביצוע עמדות מבחני ההתאמה ברוח השלמת היסודות הקרוי במספרו בסימן מבחן ה-UI-14 מאומת לחלוטין ועובר במצוין את סבב מבדקי האישור החותך.

### משימה 13.2: אישור וביצוע צווים מחמירים לסקירות כנסי מבדקי ציות והלימה מדוקדקים מול חוקות פרויקט העל של האתר (Compliance audits)

**קבצים:** אין צורך לערוך ולשנות דבר מן הרשימות שביומן זה (read-only checks; במידה וחשפת ליקוי כשלון שדורש תיקון אלו יבוצעו באופן נפרד לחלוטין כשחריגות עבודה ייבנו במוכנות מלאה לחיתום מבודד בסגירת אישורי שימור כקוד ייעודי בתוכנה שמושם אל חבילת מסירת התיקון לבדו המבוקר בעצמו בסגנון פירוט עבודות המתנהל דרך הכנסת קורות על ידי גיבוי מושלם בפקודת דחיפה כדוגמת בניית מבחן commit) · **מפרט:** §10, §11, §12

**צעדים**
1. סריקה דקדקנית להוצאת חשיפה בקרב אכיפת רשימת איסורים אודות איסור כלי כלים מפסולי תקשורת ממשק אפליקציות טכנולוגיות צד-לקוח למטרת יציאת רכיבי פלט (בדיקת קביעות תחת החלת איסורי התראות מבחני UI-15 האוסרות את סביבת הדפדפנים הקרויים Forbidden APIs): הרץ פקודת רשת למציאת רכיבי חיפוש ומילים מובנות המוטמעות בתוך כתבי השורות אצל חזית צירי יצירות המערכת על ספריית `client/` בחיפוש מחרוזת קבועות למילים כאלו שמזהות נוכחות מחשוב מבוקש אודות שימוש עם רכיבי דפדפן לאחסון מילים מול `localStorage`, רכיבים לשמירת מסלולי ביקור כ-`sessionStorage`, שירותי הכנה ותאימות נתונים השייכים אל מאגר יצרני אחסון מבוסס מערך כתיבת נתונים מקובלים כדוגמת השם של רכבי המסע בסיווג הפעלות מתוצרת יחידות קריאת מסמכים באמצעות גיבוש `document.cookie`, חקירת סיסמאות להפצת הודעות צרות מתוך חלונית ההבזק שמוכרת במסלול של המונח במילה המעוררת ← `alert(`, יחד עם סינון חיפוש קפדני לטובת ציון אודות יחידות לחלונות בחירה ושאלה מאשרות שנכללות בהגדרת ← `confirm(`, תוך צפייה לא משתמעת לשתי פנים לחתירה מלאה בהישגים נטולי הופעה מובהקים עם אפס תהודת התאמות לחלוטין בחיפושי הקוד בעמדות אלה.
   ```bash
   # שימוש כרטיס שדרת המסוף של סביבת השלל הגנרי בקו פקודות של נתוני מפתחי ידע במעמדות דרך Git Bash
   grep -rnE "localStorage|sessionStorage|document\.cookie|alert\(|confirm\(" client/
   ```
   ```powershell
   # הרצת בדיקה שוות משקל דרך עמדות פקודה בתצורת פקודות של מחשבי הרצת מידע מקומי בתרשים נתון כוחות פקודה באמצעות PowerShell
   Get-ChildItem client -Recurse -File | Select-String -Pattern 'localStorage|sessionStorage|document\.cookie|alert\(|confirm\('
   ```
2. השתמש במנועי חיפוש מקומי להרצת מילים סורקות בקריאה מתקדמת שמשתרעת לאורכה וחוצה לכל רוחבה על כול אגפי שטחי סוג קובצי האתר שמוכרזים כבני מעמד שפת הרצה עם השמות המוצהרים המסתיימים בסיומת הקבצים במילה מסוג בעלי שילוב של `.js` היושבים וממוקמים בפאת סביבה שהיא רחוקה בטווח חוץ מתחומי מעגל ספריית מאגר הפרויקטים הפנימית לחישוב הקרויה תחת כינוי משאבי השרת במרכז החומר של ה-`node_modules` כאשר המשימה כוונה לבדוק ולחשוף הצגת חיפוש לעריכת ביקורת לוכדת במטרה לעלות על זכר לביטוי שורת מילת החיפוש למושג המילה השמורה תחת הביטוי של המפתח שנעזר באותיות צירוף הקוד כגון השימוש בביטוי כ-`var`, והעלה צפייה חדה ברוח אפס מעידות ותקלות המשתקפת במערכת שדרושה להנפיק רמת תהודה על מקרים של העדר אפס הכרזות כלשהן מן המערך בבדיקה זו (zero declarations).
3. אבטחה בסיסית על עולם שימוש התלויות בתוספות רשות חבילות העזר וההרחבות (Dependencies): קרא ובדוק שהצהרת מסמך רשימות המודלים שהוטמעה במסלול הכוונה לקובץ בתוך רשת השרת אל הרישומים של מנועי מאגר הרכבים בתצורת יצירת מידע הכלול מתוך כיתוב השירות הנטוע של מחרוזות הקובץ במרכז הדרישה לשידורים באזור של `server/package.json` מציג ופועל בכך שהוא מונה בגאווה את קבוצת עזרת חבילות היסוד היחידות שאושרו בלבד ושאלו יהיו כאמור מוסכמות ומרוכזות רק ואך ורק בחבילות של האותיות המוכיחות מילים תחת הכללה אל השמות כגון `express`, עם הוספת הקבוצה שעונה בשם `cors`, ביחד עם מסגרת החבילה שמצהירה על ה-`bcryptjs` ומעגל הסיום החותם את אחרוני ספק החבילות שבמאגר עם כינויו של השירות למענה המטרה באותיות `jsonwebtoken`, ועל אותו משקל כבד של חוק תוודא מקרוב מול המערכת שאזור עבודות עריכת תוכן סקריפט התצוגה בעמודי התווך של הדפים מול מסגרת פני המערכת תחת `index.html` כלל איננו טוען או משלח ללקוח או יקרא ליעד החוצה שום פקודת משדר אל דרישה לכתובות חיצוניות מסקריפטים בעלי יעד קצה של פונקציית מעטפת צד שלישי (loads no external scripts).
4. עץ התיקיות בסיווג מידע (Folder tree): הצג הליך ביקורת המציע עריכת בדיקת השוואה פרטנית לפרויקט מול היעדים מתוך נספחי הרכבת שדרת הבנייה בקובץ סעיף העבודה מול ה-§12 בחלוקה המאשרת בדיקה לקובץ נפרד מול קובץ בשורה נפרדת בחיקוי זהה לחלוטין. בסיום סבבי ביקורות קפדניות במשטח בדיקות המרחק חייב להיות ברור שאין שום מציאות אודות קיומם של קבצי מקור צדדיים שהושתלו מעבר לנדרש (no extra source files).
5. חתימת השמות בסיווג מידע על קריאות המילון המובנה במערכת (Names): על כל רכיב מכל משפחת פריטים שקיבל סיווג תפקיד בסדרה למחלקת התאמה כלשהי או כהגדרת אזור של המצאת חללים תחת בניית מבנה שמכיל סוגת מעטפות פנימיות בתצורת כתיבת משתמש לשם התאמתם בשטח הפרויקט במונחי Class, השלמת העברות לשטח של עיצוב הקמת אזור מערכי עבודה בקביעת מקומות הכנסת מידע למונחי פריסת מבחן למבנה של field, כל פונקציית תנועה ושרטוט להרכבת מידות המערכת וכל מערך middleware, כל כיוון ומסלול שסומן על גזרת צורת אופן מסילת ציר הקוראת ל-route המאפשר נתיבי מעבר בקצוות ולצדם במבנה היררכי אחרון אודות מתכונת כל שמות הקבצים עצמם נבדקים לעמוד מיושרים ותואמים לחלוטין וללא רבב אל רכבי נספחי התיאום וכללי הטקסט של ציון הדברים מול הכתיבה של הגדרות המערכת במונחי התיאום מול פתרונות הדקדוק של ספרי תורת המפרט המחייבים שבדפים במפרט.

**המשימה הושלמה כאשר**
- [ ] כל בקרת מסע ממבדקי החקירות הדקדקניות בסקירות המחמירות על ביקורות התחזוקה חוזרת אל סיומה בהשלמה נקייה, יחד ובמקביל לצירוף הצגת מסך המראה כי הפלט שנפסל לבקרת בדיקת חסימות האבטחה במסלול תאימות מבחני התצוגה כדוגמת עמדות ה-UI-15 מוכרע ומשיג עליונות בצורה כתיבת נתונים שעוברת באות הצלחה בסמנטיקה המשתקפת לראווה תחת `Pass`.

### משימה 13.3: מבחני צל וביקורת עומק לוידוא כיסוי הרצה במבדקים של אזור מבחני הדרישה (Coverage audit)

**קבצים:** `server/tests/system.test.js` (יש לערוך את הקובץ פנימה להשלמות אך ורק ובתנאי שאכן נתגלו פערים במקרי הכיסוי במהלך בדיקות המבחן) · **מפרט:** §13

**צעדים**
1. אסוף והעמד כרשימת מדדים את כל מקבצי ייצוא הפקודות שעומדות לרשות התשתית החוצה בעמדת הכוחות מכל מודול ומודול הנסמך ועומד באזורי הפעילות בצידי חלונית מתחמי השרת שבאזור ה-`server/`, תוכל לעשות כן כשלעצמו באמצעות פקודת רשת למשל בכלי נתונים במעמדות דרך הכנסת השורות בתצורת הנחיית פעולה שתפיק ותציג מידע בקוד דוגמה עובד למשל בהרצה על גבי קריאה כמו: במבנה הפקודה למשל על שימוש בביטוי במונח זה ← `node -e "console.log(Object.keys(require('./utils/calories')))"`. הרץ מלאכה שיטתית שכזו בצורה פזורה כנגד כל מודול אפשרי הנמצא בנמצא בעליל בתוך שרת המקור בצירוף סקירה שלמה בעבור הקצוות האחוריים החונים בקרבת סף צד לקוח תחת רשת של עולמות שחולשים בסביבת מקומי הקוד במסלול ה-`../client/script.js`. בעבור איתור מרכיבי ייצוא ופקודות בסיווג רכיבי חקר אל מחלקות כעין מבנה עבודות במנגנוני הקצאה ליצירת עמדות אלמנט במבנה Classes, דאג להוסיף רשימה שתפרט יחד בהקפדה אישית תוצאות קריאה לפעולה אל מול קצוות חומר הדרישה המכוונות לחקר וסריקת אמצעות הכנת רכיבים בתצורת `Object.getOwnPropertyNames(Class.prototype)` בתוספת לאיתור וחקר עמדת המצב לפונקציונליות השירות שעולה מחקר הבחינה מול שדרת מידע שממיין את הכוח אל המתודות הפנימיות במונחים של הגדרתם הסטטית (the static methods).
2. בצע בדיקה ורישום המעמת ווידוא יציב וחזק לאמת אבחון בו ניכר שכל פונקציה מסוג שהנפיק כלי ושוחרר מהמודולים למקומות הרצויים על מנת לשמש כמיוצא (every exported function), כמו גם אלמנט מתודה פנימי מכל מחלקה (every class method) וכל מנוע פעילות עבודה לוגית לפונקציה מבודדת טהורה במרכזי קבוצות בצדדי מערך הלקוחות העובדים (every client pure function) מקבל הוכחה על מימוש מציאות בו הוא מככב מופיע ונשען במפגין ובאופן ברור ופעיל לפחות בתור אזכור על גבי הצהרת מבדק במקרה בדיקת מערכת אחת הקרויה לניסוי בשורות מבחן ה-test. השלם פערים בעזרת עבודות שדרוג של החדרת והוספת מבחנים עבור כל ליקוי חסר עבודת כיסוי שיצוץ בביקורת (Add tests for any gaps).
3. הרץ מחדש ביצוע ניסיון פעולה כולל למערך במבחנים במלוא היקף אורך ציר בדיקות המסגרת של כלל סוויטת המערכת הגדולה על כל בדיקותיה (the full suite).

**המשימה הושלמה כאשר**
- [ ] הבוחן המסווג והשמור על מדד השורות לאיתות בחינת תוצאות במספר מקרה הרישום שבמילון נתון תחת מסלול צלחות AUTO-01 הגיע ועבר בשלמות מרבית תחת ציפוי קריאות שמציג אותות כ-passes: ציון רשמי ומוחלט שמשתקף ללא תקלות ברף של שגיאות 0 על הכמות (0 failures), בגיבוי מתן ודאות מאשרת לעובדה חותכת כי לכל פונקציה מכלל המיוצאות קיימת ובנמצא לפחות בקרת בדיקה אמתית המשויכת עבורה לבדה.

### משימה 13.4: הרצת רשימות אימות בוחנים עולמית מטעם פקודות ביצוע מלוות בביקורת המשתמש על ידי אמצעות עבודת בדיקת קבלה בקווים אנושיים וידניים במונחי קבע ידניים (Manual acceptance run)

**קבצים:** `TESTS-LOG.md` (עריכה) · **מפרט:** §14

**צעדים**
1. סדר את מיפוי המאגרים וטפל בריענון וניקוי מוחלט של מערכת מרכזי בסיס הנתונים שיאפס אותה עד להגעה לנקודת הבסיס השמרנית מיום תחילתה בצעדים של נקודת קו הזינוק ברוח מהלך מקורי שנבנה ושמור תחת הנתון במושג המערכות למסד השורשים כמצב הניסוי הטרי הערוך במעמד יסוד האבן הפשוטה בסיווג עבודת העומס כפי נתוני השירות העונים בסגנון (the seed state כנראה במקור לתיקוני תהליך העבודה המוצעים במסעי ההקמה מסלול בעמדה לתיקון הפרויקט במשימה כגון במקרים להצבת יעד פנייה בפרטי משימות מסלול כמו בסוף לטבלת המידע על נתון במשימת משימה 13.6 אודות נתון צעדי תחילת הכיוון שם בשלבי פתיחת צעד בניית הרישום מסוג מספר 1) ורק לאחר מכן צא אל דרך הנעה עם חיווי הרצה שפועל בכוחו אל הרמת יסוד כוח השרת שידלג לפתיחה ויעלה מהפעלת פקודת ההפעלה בעזרת קריאת ביצוע באמצעות מילת אכיפת שגרה כמו `npm start`.
2. עבור בצורה עקבית שורות והתמודד בסבלנות באופן פרטני ולעומק לאורך ומעבר על צג העמדות בפניית שידור בכל שורת בחינת קודי מערכות בקביעות למקרי נתון הנספח תחת הגדרת מעמדי טבלת ערוצי בדיקת ההחלטות לפי מקומם המובא במסגרת הרכבי החוקים שבטבלת הפרויקט במונח ה-§14 בסעיפי אזורי המערכות שממוקמות ומרוכזות בחלקן על שפת השכבות האחורית בקריאה למקומות בסביבת האזור העונה על יריעת פרק מסדר היום באגפי קבוצת הבדיקות האחרונה בדף במבנה המוצג במגזר שבו רואה אור החלק הנקוב בסעיפים עבור פרקי מיקומו באזור מערכי רשומות כמן הרקע של עמדת לוח רשומות המידות לסיכום במעמד הקרוי: [נספח (Appendix) בדיקות מפת ענפי הקבלה כחוק](#appendix-acceptance-checklist-map-14). דאג לשמור ולחקור במקצועיות בעת הכרעת פלט כנגד דימוי לכל תפקיד במערכת יחד ברוח הפעלה אדוקה במופגן בתור חובש את תגות כובע המסמל והמעניק תפקיד הרלוונטי הנכון שעולה עבורו (או לחלופין מספר צברי קליטת מעמדות נפרדים על זהות מסוג כלל התפקידים המותרים הקשורים), ויש לעשות זאת תמיד אך ורק בתוך שילוב הקמת מסלול הרצה במשטח של כרטיסיית דפדפן טרייה ורעננה נפרדת במקצת עבור כל מימד המרכיב גורל עבודה מול תפקיד אינדיבידואלי אחר לגופו על מנת לחצוץ באופן שימנע מעבר וזליגת עובדות בקווי המערכת.
3. תקודד ורשום בחלוניות הבחירה פקודות אות לתיעוד משתנים שיגידו מעבר תחת המונח `Pass` או חסימה מול כשל בצירוף נתוני חריגה של סימון כמו ה-`Fail`, ושלב לתוך התיעוד לכל עמדה גם תאריכים מוסדרים המסמנים את החלטת יום הבחינה (the date) ולבסוף כתוב נתוני הסבר אודות הגשת ממצא שמכיל סיקור של צורות ראיות מענה הבדיקה שעלו והוכחו תחת דיווח מסקנת מילה משותפת הקרויה (evidence) במדדים שנוגעים בעבור יחידות בדיקה ועל כל דוגמת המבחן (check). דאג לרכז כרישום כל הודעת מציאות ודיווח אודות פגיעות פריצות ונפילות ממערכות הפעלה שצצו בדרגות ועיכבו צליחת עבודה בסדר של רישומים קפדניים שידווחו היטב וללא פשרות לרובריקת התיק שמתעד רצפי אירועי שבר במנגנוני הקבלה המכונים טבלת התקלות הראשיות שבקובץ (Defects table). את כל הליקויים שנתגלו חובה עליך באופן מושלם להבטיח את תיקונם בהוצאת משלוח מבדק של טיפול אדיר לבעיות שנצפה ויכוסה וימצא כתוב ומקודד באגף השמירות לעבודה אל מול נרתיק נפרד בסדרת חסימה אישית לעדכון במשימות עצמאיות שיצאו ככל אחת לבדה בממשק הבקרה של מאגר הכנסת הפעולות כמו מסירת מראה מחויבות לטבעת בניסוח החקירה השלם תחת שמו (commit), וחזור לחזור תהליכי הפקת מבחן שני לברר אמינות ושלמות בנקודת אימות הבדיקה השלמה והראויה עד שקיבלת תיקון ורווח ראוי בעבודות התיקון שהעלית כקוד (re-test).

**המשימה הושלמה כאשר**
- [ ] רשימת מעמדות קבועה שמכילה אגף בסדר גודל רציף מול מצגת על אורך של טבלת מערכת קודים בעלי הרשאות כניסה עם היקף כמות של משטחי 37 בדיקות במצטבר מדווחות כולן עם השגה של תהודת סימון ירוק בסטטוס החתום תחת אבחנת אישורי הצלחה במילה → `Pass`.

### משימה 13.5: תיעוד פרויקט חותם ואחרון למלאכת מסמכי העריכה במסירות אחרונות ליצירת מבחן (Final documentation)

**קבצים:** `README.md`, `AI-LOG.md`, `TESTS-LOG.md` (יש לפתוח בעבור פעולות אלו מסך ולשם שינוי עריכה והוצאה לאור מחדש) · **מפרט:** §12

**צעדים**
1. בקובץ חזית המאגר אל עמדת התפעול תחת רשימות המידע השמור אל `README.md`: תקן ורפא כל סימן להערת מקום שדורש טיפול במערכות פתוחות שזועקות אל רחוב הפרויקט בהצגת חסרים שמלווים בסימוני שלטים כגון אזכור ההגדרות תחת המילה העוקבת של `TODO (Task 13.5)`, בנוסף לביטוי כוח מוסף שמרכיב ומרחיב יכולות בקריאה לעמוד השדרוג שמסדר צירוף העמדת פלט של חזית המערך כצורת מכלול בהעלאת שורות של רשימת תכונות המערכת העתידית באגף מסודר (feature list) ולצדה הגש צירופים קצרים ואסתטיים במתן נקודת סקירה אל מבט על ללא כובד למערכי קו החיבור בשירות אל היצע כוח מנוף ה-API המהיר שסובב ומראה תמונת מצב מעודכנת אודות החלק הדן אל חלוניות קווי הקצה המסיימים בתחום מערכות מסד הנתיבים מתוך פירוט הדרישות של נקודות הקצוות שבפסגות הדרישה בערוץ התחומים שסומן בנספחי סעיף ה-§8.
2. בקובץ התעודות של הראיות המחקריות ביומן ה-`AI-LOG.md`: סקור ווידא שהבטחת כי עבור כל כוח הנחיה והזנת מסרים אל מאגר חשיבה ופקודות (prompt) אשר התבצעה בפועל עולה במידה נכונה ומורכבת קיומה של הוספת רישום בעל תיאור תיעודי שנותן עמדה קבועה אצלה ממוקמת באגף כדוגמת עמדת צבר שירות מקביל ומשמש כניסת קו הוספה על שדרת פקודת רשומה אישית כמו (entry) ונוסף על האמור לעיל קביעה קשה ובלתי משתמעת שבהחלטות התוכנה מחייבת לוודא מעבר רציף שמוכיח את נכונות העובדה הגורסת באמונה שכל פסק דין הכרעתי בפרויקט שמכיל ציון פקודת העברת שינויים במונח מסמכי האפליקציה או בעצם בסיווג ההגדרה כהפעלת מצב בחירת שיקול באור ההחלטות כמוסכם בכיתוב (decision) יש לה דריסת רגל מושקעת והיא אכן מאוחסנת בבטחה במגירות השמורות לעדכון בחקירת החשבונות של תחומי מאגר הפעילות ופלט יומן תיעוד ההחלטות (Decision Log). הוסף בסוף של מסלול המסמך הנדון גם חלק למען פסקת חתימה מסכמת שמונעת התפזרות תחת פתחי עולמות מעבר לסיום ומציינת פן מסכם עבור סקירת אירוע תחת חוק פתיח קטע במבנה הדוגל במילים לעריכה למשל בהצבת הגדרת חותמת מילים לסגירה כסוף פסוק בדיווח קבלת משמעות מסוג מילת חיתום אופטימית כמו סיכום של עבודת חיתום (closing summary).
3. באחריות קריאות קובץ השלמת הנתונים עבור אזור מעבדות המסגרת העדכני של ה-`TESTS-LOG.md`: הדבק את תוצאות הפלט של השורה המסכמת האחרונה שהופקה מסיכומה המנצח ממדגם כוח הריצה הסופי שרץ תחת החלונות במבחני רשויות בדיקת תוכנות המערכת ומוזנק במילה `npm run test summary` בצירופם הישיר של נתוני השלמת תוצאות הסיכום (totals) אל פני אורך קווי הפעולות הכוללות מכל סך משמעות הנתונים שעולים בחישוב ציוני כרטיסי תפוקות התנהלות המבחנים מרשימות עקרונות הניהול כדוגמת משפחות מבחן בדיקות התיוג ברמות אדם (checklist).

**המשימה הושלמה כאשר**
- [ ] כל השלישייה כולה לחלוטין מכוחות האסופה של המסמכים שנאספו ומוכרים לחזית מתבררים כמסמכים גמורים, אפויים ומוכנים המהווים וקובעים שהם בחזקת שלמים וגמורים מקצה לקצה (complete), עת בשעה המציירת שהן כולם כאחד חפים ונקיים לחלוטין מהצהרות מחוות המותירות מסלולי קבע אל זרזי משימות חסרות מילוי כמו למשל ערימות קוביות מסקנות שמכילות ציון אזכור אל שלטי כיוונים עזובים וממתינים ממימד של הודעות קבע כמו עדות למילה של התווית שקרויה `TODO` ואין שום השארת פינה מוזנחת כלשהי מאלו בהוויית העמודים (no TODO left).

### משימה 13.6: שחרור ופריסת סיום של חזית המערכת במסירה גלובלית (Release)

**קבצים:** מחיקת מאגרי איפוס דרך נתיב כמו ה-`server/db/*.json` (פעולות ביטול פנימי במאפיין של פקודת שדרוג בשם ריקון והפעלה חוזרת על נתוני הקיום שבעברו אל מצב חסר דמות דרך מסלול מסווג כמו - reset) · **מפרט:** §5, §12, §13

**צעדים**
1. אפס את מנוע המידע המופקד בתיקיות מסד הנתונים שקרוי במקום שמסומן מתוך דלתות התווך של נתיב ה-`server/db/*.json` והחזר אותו לעמדתו בשלב נקי על גבי בסיס של מרחבי נקודת הזרע הראשוני החשופה (the clean seed) שהושמה בעבר מימי שלב התחלת פרויקט במשימה כמו המאמצים במשימה 1.5: צמד גורמי הבסיס בעבור קהל חברי המערכת שמכילים את יסוד משתמשי ההתחלה בגרעין העבודה (seed users), מלאכת טעינת של המאגר הראשי בעולמות הפעילות עבור תרגילי החובה במקור קטלוג הזרעים שמהווים יסוד למערך (seed catalog) בצירופם אל נבחרת יסוד של ששת קבוצות השריר המובנות הלוכדות עולם רשומות במרכזי קבוצות מאגר השרירים כמתחייב כדאורייתא (the six built-in muscle groups), כהשקעה השוללת בעליל הימצאות של שום עובדת שימור אודות חלקיקי שברי נתוני ניסוי ידניים עזובים ובלתי אקטואליים שנצרבו והותקנו פנימה בקריאה לאחור מזירות הניסיונות של מקרי העבר הרחוק אל מערכות הכלים בהקראת מידות מופעלות תחת חומרי העדויות על תחקיר מסעי מדגמי עבודה על מבחן במקרים לא ידועים (manual-test data). סיסמאות טריות למראה ורשומות על ידי כתבי קריאה למשתמש על בסיס הנראה לכל עין במבנה מסוג קוד פשוט וארוז כגוף כיתוב פלט על קוד טקסט פשוט גלוי לחלוטין וללא הצפנה (Plaintext seed passwords) הינן לחלוטין ראויות להערכה ותקינות לכל דבר, מכיוון שכמובן מובטח מראש כי ישנן הבטחות ונהלי טיפול וודאיים להזרמת הכתוב בהמשך לקליטתם במסנני עבודה שמייצרים מיד חומות הצפנה במכלול השמדה אל ביטוי כביכול במקום קליטת מסתור מסוג הפעלת האשים מתחבאים ונועזים דרך קודם במתן שורת שדרות השגחות של החבאתן בחשאי (hashed) וללא מתום כבר באווירה בעת טעינת שלב ההפעלה הראשון ממש בסמוך לתנופת דריכה על המסלול בחניית שחרור של השרת במתחם תפיסה כמפורש כחוק במקור §5.
2. הרץ קו שלם לאימות קבוצת מבחני המערכת במלואה מעל משטח סביבת עבודה אמינה של מחשוב רענן שיונק עובדות תחת השקת הליך רשת ישר ובלי ניקוי כמו מתחם צבירת קופסאות כניסה המכוונות תחת ענפי פלט של פקודות בהתקנה נקייה טרייה (fresh install): העבר ציר למסע למחיקת נתוני עומס ממאגרי הזיכרון אצל מערכות כיוון וצינורות צד של עץ הפיתוח כשההנחיה סורקת אל כוונת הפסילה וגריסה על התיקיה השמנה במערך הכילול שעונה בשם אגף ספריות הצד בנתיב המצוי תחת התווית הכוללת של עמדת ה-`server/node_modules`, וסמוך אליו הרץ מילוי מחדש שמזין בכוח משיכה מתחדש וחי את רכבי המסע דרך טעינות עזר פקודה על שאיבת משאבים דרך בניית הבסיס במסגרת חזרת קריאת התוכן להתקנה מאזור חבילת שורת מתודת מנועי רשת ממאגרי כלי ניהול מרחוק להבאת חלקי הפרויקט כפקודת `npm install` שבנוסף אליה תוזנק הקפדה מיוחדת עם חפיפה של חידוש בדיקות שדורש הרצה ישרה במנוע להעמדת מבחן בהזנת חוק של ציר הרצה ב-`npm run test`.
3. בצע גיבוי מעשי סופי של יציאת יעד מסודרת בהשמה שקוראת ומעניקה פקודת רשם מסמכים מקודדת על מנת לבנות גיבוי מנותב של מכלול יצירות הקוד במערך המכונה כעין תיק במילה פנימית כ-commit, שלח ודחף עותק אמיץ וחזק כלפי אל עמדות ספריות רשת גיבוי כוח ההיסטוריה הכללית במאגר באמצעות פעולה דוחקת של מערך השליטה לכיווני החוץ תחת משדר על ענף שגורס הפעלות על יד כוח זרוע אכיפה באמצעות שיגור ענף העבודה במסירת קוד שנקרא כגורם למשל במצב הזרמה תחת (push the branch), והוצא לאור עלי עולם פתיחת קריאה רחבה בעלת מתן אישור בקשת הצעת כניסה נאותה ליצירת חיבור אל ליבת מערך הרשת שמועבר בדמות בקשת משיכה הולמת (pull request) ישירות פנימה לתוך מסגרת הענף שמקורי שמהווה הכתר השליט במערך תחת הבסיס למקור מן הנתיב הראשי במילה שמוכרזת ללא הרף כגזע התיקייה שעונה למיקום בשם מרכז מאגר אל ענפי היסוד הנקרא `master`. הבקשה שהורמה כאמור נדרשת בצורת חובה חותכת להביא למצב ולשאת במרכזה פסקאות מתאר המסכמות תחת הצגת רשומות שמנפיקות מאמר תמציתי וממצה שנועד לזקק נתונים במעטפת התיאור הקולע ומכיל את מסקנות כל מהלך שלבי שלד העבודה הקודמים במערכת הכלים הכבירים (summarizes the stages) יחד בנוסף אל מכלול הפלט הקובע בטבלאות התוצאות הסופיות למסלול ערוצי בחינת הפסיקה אודות טיב שילוב בדיקות המערכת האוטומטיות (final test results).

**המשימה הושלמה כאשר**
- [ ] מסע הבקשה החתום לפלישת נתיב לעבר רשת האב בהצגת הנתונים כדוגמת הבקשה בסוגת אישור בקשת כניסה מבוקשת כ-pull request אכן פתוחה באופן ציבורי לעיני המערכת במצב תקני העונה על מציאות במילה הרשמית שקשורה לבקשות במובן של הגדרת קיום מסוג `open`, תוך הדגשה נוספת שאכן שכפול גולמי וצח כקריסטל הנחצב באבנים בעותק משטח עבודה רענן כתינוק שאך עכשיו נוצר ויצא מרחם הדפוס בסגנון שיגור מסוג מערכת נתונים הבאה מקצה הרשת (fresh clone) צולחת כהלכה וזקופה בגאון ללא מעידות עם מיזוג כלי יעד של כוחות ריצה שקופצת באמצעות כלי ציווי למען כוח אכיפת מכלול הכנת המכלים בהזנת `npm install`, התחלת מנועים בתדר נסיקה שעולה במסר כלי של המונח במילה אל יסוד הצבת העבודה כ-`npm start` וסיכול תקלות באמצעות זרם מתחדש במעטפת הפעלה שמחויבת לעמידה במבדקים תחת העדשת קריאת מילות החוק להוראה שכוללת הכוונה לתוצאת עמידה מסוגה במילה של מסלול כדוגמת פסיקת הפנייה על יעד `npm run test` שמציגה עובדה חיה ומדויקת באופן מושלם להפליא וחופף למקור ונימוק ממש בדיוק מושלם באותה רמת גימור עליה מורה כיוון המסלול הקבוע בספרי הקוד של יומן הגדרות ההסברים הפותחים שמלווים בתוך צעדי הכיתוב אל צילום מצב ההפעלות שמקודדות ברשות טקסט נאות אל עזרת מאמרי השירות שבקבצי הבית במחיצות של המערך המקדם על כינויו כקובץ הדרכת הכיוונים בתוך המיקום לקריאת מסמכי מדריך שמשמעותם השמור במלל על מסלול ה-README כפי חוק הדברים שלו כמתואר לחלוטין.

---

## נספח (Appendix): מפת ענפי כללי מבדק מסלול וקווי בקרות בדיקת קבלה (§14)

השתמש בתוויות הקוד של המזהים הללו באפיון ההוראות המצויות ב-IDs בתוך מאגר הרישומים של מסמך דיווחי מבחן האפליקציה ב-`TESTS-LOG.md`. **המילה שמציינת את החלק האוטומטי (Auto)** באה למסור מובן ולציין כוונה כי מסלול יחידת מקבץ קבוצת כוח במערך הבדיקות האוטומטי שעומד לרשות המערכת הוא זה שלוקח בחסות תפקיד עשייתו במצב שנועד להיות זה שאכן מספק בודאות עצמאית מוחלטת כגורם בלעדי את התעודה ואת עדות הראיות השלמות הנדרשות לאישור במבחן (the evidence). בעוד הגדרת ציון משמעות אודות חלק ההפעלה **בצד הידני (Manual)** מורה משמעות המדברת אודות אבן בוחן הכורכת מעבר אל אילוץ הכולל בחינת עבודה בסגנון מבדקי שיטוט ידני מעשי לתוך מראה וממשק אקטיבי מחיק צד מסך המשתמש הציבורי אל תחומי עבודות בדיקה בסביבה חיה בשולי חלון המציג את סייר מנוע גוף הדפדפן בגופו פנימה עצמו (the browser) או מצד שיתוף אלמנט תחת בקרה שנעזר על ידי צורת הפקת מבחנים באספקת שידור מקלדת לזירת לקוח של בקשות פלט ממוחשב שמזרימות שדרי אינטרנט של חבילות HTTP לשירות עבודות ברשת המידע (HTTP client).

| קוד זיהוי מזהה (ID) | בדיקה (§14) מתוך טבלת החקר אודות המקרים (Check) | סוג הוכחות (Evidence) | משימות יעד מקושר (Task(s)) |
|---|---|---|---|
| AUTO-01 | הבדיקה תחת סימון סדרי ריצה של `npm run test` צולחת וחוזרת ירוקה לחלוטין וללא מתום במערכת נטולת שברי כשלונות על נתוני דוח תקלות אפסי שמצהיר כביכול כמות שכזאת של `0 failures`, ויחד בנוסף ניכר מעל גבי הוכחה גמורה וחותכת המציעה שכל יסודות מנועי הביצוע על שדרת התוכנה כשלעצמן במקרה השלם של מערכות מתן כל פונקציונליות השירות שעולות מהרכבת המודולים על פי מסלולי היציאה שלהן ומשווקות להמשך המערכת החוצה בידי כוחות המיוצאות כמתוכנן (every exported function) רוכשות להן תמיד מעמד בלתי מעורער ולפחות מימד אזכור ועירוב נתון מינימלי בשיגור של נקודה אחת המציצה בהופעה בבחינה שקיימת על גבי נתון סדר גזרת עמדה מול מבדק יחיד במערכת (in at least one test). | מערכות פעולות מיכוניות עצמאיות בממשק של פקודות בשורת התחביר האוטומטי כמו Auto יחד ובנוסף לתמיכה סוקרת מדדים לרוחב בדיקות הכלת מסגרות ההגדרות מצד הוכחה תחת מבחני עזר שמקודדים סמלי אימות על סדרי כיווני כיסוי הרחבה לנתונים (coverage audit) | 13.3 |
| AUTH-01 | מסלול פקודת ההרשמה יוצרת ומשגרת ישות מזהה עבור אלמנט השמור למרכיב פועלי הדרג הזוטר בשם תג ההכרות העונה למעמד `user` בעל עובדה אשר מסתיימת בפלט שדואג להוציא מסמך החזרה בצירוף מכתב אישורי המעטפה הכוללת הברקת מטען נספח שבו נמצא יחידת הכלת אימות נתוני זיהוי כמבנה פתרון הכולל הענקת מזהה מוצפן בסיווג הפלט הידוע על מונח אישי וראוי להחזר כשם כרטיס המערכת הקרוי (token); מצד מנגד ניסיון דחיפת פניית התראה אשר זקוקה ליצירת בעיה שעלתה עקב הימצאותו וכפילות כזו של הופעת נתון משוכפל הכלול מתוך מצב בעל תמונה סביבתית של שם אשר כבר היה נתון ותפוס במאגר אצל בעלי תארים של שכפולים לשם בעל זהות מקבילה (a duplicate name) תפעיל חזרת הד המטיח מערכת בלימה המרחיקה ומוציאה תקלה בעלת תו הודעות ענישתי השמור על ציון קבוע כמו מספר הפלט החוזר למניעה ונושא מסר נדחה ← `409` | שורות המבדק תופעלנה לחלוטין לכל דבר באמצעות היררכיות מכלול של יסוד הרכבות נתוני רשת מסדי מבחני מערכות שישמרו בהפעלה אל עבודות מערכת משלוח שדרת קצוות ניהול האכיפה העצמאית במבדקים למסגרות מחלקת המשתנים (Auto) הנשענים תחת צל מערכת מחלקות על בדיקות קצוות מסלולי תיאום קווי מתאמי חיבור הרשת (API routes) | 7.1, 10.4 |
| AUTH-02 | עמדת הפעלת נתיב החיבור במערך כניסות הפעלות מערכת בסיווג אמצעות תפקיד עבודות הקבלה שקשורה במסדי העמדות בדרכי הקשת פרטי התחברות לזיהוי כסעיף שפועל ב-Login כשהיא מאומצת תחת כיתוב מלווה בהכנסת פרט בלתי ראוי משדות ההזנה שמכיל סודות על סיסמה מוקשת כוזבת ופסולה שמתורגמת בזרם התהליכי כשגיאת כשל (wrong password) מסתיימת בחזרת תוצאת פלט שמשגר עמודת הופעת מידע מסלק באזהרה הכוללת סיווג תקלה עם אות קוד מחמיר אל המבנה שמחזיר נתון השלכה לאישור הבעיה כמו במענה הדוחה בקטגוריית מספר החסם תחת האזהרה שנושאת במבנה הדחייה תחת מספר ← `401` בצירופה אל מערכת מלל הופעת מסר תעודות הודעת נתון תבניתי במתכונת דיבור כללי למניעת חדירות (generic message) | אמצעות מערך בדיקות בכיווני זרימת הליכה שמקורה מתדרי סיווג כיווני פקודת השתגרות ששולחים שידורים בסביבה בהקמה עוקבת אל חבילות נתונים משדות על סוג בדיקת מבחן במרכיבי פקודת אישור שמשקף מונח עצמאי בידיעת אמינות של מערך מכלול הבקרה בסביבת ה-Auto ולצדו תפקיד של תורם אזהרה בסיוע מערכות קטעי יסוד של נקודות הקצוות בקובץ API routes | 7.1, 10.4 |
| AUTH-03 | נתוני קו קודים של פריטי סיסמאות ההתחלה המוטמעים עמוק ביסודות המאגר תחת משטחי ההשקפה המסמנים קו על פריטים בסיסיים הקרויים כמו בהגדרת אפיון שורשי השמור לזרעים (Seed passwords) הינם מתורגמים והולמים לסעיף הגדרה בעל מערך מאובטח של הצפנות אל צלילי ערבול מידע שמקושקשים ומחופשים במכלול צללים מסוג כזה שמקביל לאשכולות טשטושים בקריאה לשמות הקו של מחרוזות מפותלות הידוע במילה כמו האשים מבית הספק המגן והמוכר ביותר באזורי תחומי ההבטחות שמכונה באמצעות גופו מגן התצורה אל המלל בשם תצורת מנגנון העבודה החוסם מסוג פסיקות ה-`bcrypt hashes` בתוככי צלעות אגף מאגר מרכזי לאכסון שורות הרשומות שמוכן ומורץ באופן פשוט תחת קובץ בדומה למבנה מקביל שנשמר בגנזך בשם ← `users.json`, וכל החשכת פעילות פשוטה כזו אל סיווג טקסט חופשי זה משתנה רק לאחר צליחת מעבר הרצת ניסוי חותם סיום בשורת פעילות מאמצי חומות האמצעים להנעת מערכות הפתיחה במערך השלם לביצוע תדרי הפעלה המקודדת בשחרור הראשון שמוציא למשתמש יכולת אל קבלת פתיחת המסך הראשון בהרצה תחת קביעת מועד השלמת מחזור הרצת חיים במאגר בהפעלה מול ציון תחילתו של השחרור בראשונה שנודע ונרשם היטב בדיווח במסר כהשלמת התנעה והתעוררות מאובטחת בסביבת תהליכים מתוך תיוג של נספח במעטפת הופעה על ציון הקרוי כמילת התאריך בפתיח של - the first start | יצירת אמון במחזור הכללת מרכזי בדיקה של יעד סוג אבחון מבוקר פקודת עבודה ביצועית מסונכרנת (Auto) כשהפעם התגבור ניתן מצד פני חברות מערכת הפעלת מדדי עמידות ופיקוח תשתית עולמות נתונים הנעוצים ומבוצעים כהשלמה למדדים ממפעלי מוקד מסד המסלולים במערכות שרצים במחלקת הניהול אל מסד כלים על קובצי צמתים בהגדרת צלילי עבודות בעלי קטגוריית מערך מסד ביקורת וניתוב (DB utils) יחד בשילוב השגחות הפעלה ועין צופייה של הזרקות קלט בסיווג פעולת המבקר אל נתיבים מנוהלים מכיוון אישורי התנגשויות בהבטה באמצעות בדיקות חקר במעטפת סקירה מהכיוון האנושי תחת מובן וסדרת בוחנים של משקפים המקרינים מנגנוני הבטה על ניהול באחריות הקצה לאופי ההבטה מסוג מדדים מקומיים של צוות המבחן למקרים של קריאות סקירת ידע ומשטחים של צוות בקרה במרחב אכיפת הצוות שבאיוש הבנה שקרויה בתרחיש למאמץ מבחנים בתיאור וביטוי ה-Manual | 4.2, 4.4 |
| AUTH-04 | לעולם אין שום הצגת החזר לפס מידע בתצוגת תוכן תגובה משדרת שנפלטת במראה המערכות לאורך יציאת הודעה השייכת לתגובת מקרי סביבת נקודת הקצה הפנימיות שמדברות מהסוג כמו מערכת תדרי API שמוכרזת ומכילה במרכיבי האובייקטים וההחזרות בחזרתה את קיומו של הפריט הנושא תו שורת ביטוי לבעיה רגישה וקריטית הקרויה בהוצאת מילה סודית כדוגמת ← `password` | קבוצת הוכחות הנבחנת לעולם הבוחנים תחת מטרייה מסוג מעבדות תחת סדר אוטומטי במרוץ עמידות אמיץ לעמדות האמצע המכוונות מסלול עיוור בציון המילה שמכילה (Auto) עם העצמה וסיוע בטיפול מקודד שהגיע משלבי הרצות בעמודי צד התקנות הבוחנים למעטפת הפרוטוקולים לממדים אל מסלולים תחת הקצה (API routes) | 7.6 |
| AUTH-05 | פקודת שיגור שמונפקת אל המרחב של המסלול באמצעות מעטפת טעינת גוף מבנה דרישה פשוטה שבתוכנה חסר גורם מחבר ובולט בהעדר מסירת מזהה המגדיר חותם אבטחה תקין מהצורה הנשלטת בפעולה חסרה ללא טוקן אישור מעבר שריר (without a token) זוכה לחסימה ומוחזרת במבנה טעות בעלת דחייה נדחקת במקרה כישלון בנשיאת מילת הרחקת ערך ענישתי השמור לקוד מסר דחיית אישור הלוכד את הודעת הסירוב בפלט תחת מספר כגון ה-`401`; במקביל לזאת, ביצוע של הרצת פקודת ריענון למסך (a page refresh) מחזירה בסופו של עניין תהליך אוטומטי שמעביר וכופה חזרת לקוח כיוון של הנחיתה שמדביקה ומושכת היישר אל נתיב סביבת דלתות עמדת הכניסות במיקום חזית שערי מסך המערכות מול עמוד הגישה השמור לקיום מופע התחברותי מקומי שמעמיס את תחילת עמודת זיהוי הכתובת בכינוי הפשוט שסובב עולם במונחי הופעת עולם של סרגל עמדות מסוג (the login screen) | אימות עובדות מסופק ומתועד בצורה משותפת על זווית הבסיס במסלול תחת הנקודה המרכזית כדוגמת עמדות המורכבות מצד מחשב ביחידת קלט בעלת מערכת עצמאית מתוזמנת המסווגת בתבנית המילה (Auto) לצד גיוס צוותי אימות מבקרים באיוש צד מסך אנושי בזרקורי היצירה במלוא שמם המפורש אל סביבת ביקורות המאפיין עובדה מן בוחן נטול גישה בממד של בקרה המכילה ביטוי קשב מסוג של המידע הנמצא בתחום מילות תדרי הציונים במילה על משקל הביטוי הנפוץ כמו בוחני (Manual) | 6.1, 10.3 |
| RBAC-01 | משתמש (שכבת משתמשי הרשאה זוטרה בסיווג מעמד כגון a user) איננו יכול ומוגבל מיכולתו החופשית מלהצליח ולייצר מהלכי הגעה תקינה (can't reach) שיצלחו מול שליחת משימה בדרישה שממוקדת על הפניית נתיב פקודות שמבקש הכרת פריסה נרחבת שמוקצעת תחת שיגור דוגמת קריאות ל-`GET /api/users` או לחלופין בקשת משיכה שקוראת לעבר כתובת פרטים אודות חבר מנויים כמותו כמו אלו השמורים ומאוחסנים אצל צד אחר מבעלי מסד עמיתים בסביבת תיוג נתוני משתמש זר שאינו עצמו בסביבות פניית אפיק המידע שלו כמו במסגרת צילום היררכיה לעבר ענפים בסגנון מיקום קיומי שמוצפן כגון נתיב שעולה לכיוון של פתחי יעד שסופו כמשלח קריאות בבקשה אל התנאי כמו דוגמה ל-`/api/users/:id` על מישהו שאינו קשור אליו מן העבר (וזוכה להשבת נתון המעניש שמוביל בעקבותיו מיד לחתימה בענישת הסירוב מתוך הצבת תו פליטה אכזרי מסוג המסר שגורר אל `403`) | סיקור שלם המספק אישור אמונה באמיתות העדות תחת חותם של מעמדות מנגנוני שירות בעקרונות בקרת כלי בוחני צעד מסדר אוטומטי נרחב אל עולם שרת קפדני (Auto) אשר יצוק בתנועתו כעוזר מחבר אל משמרות הפעלת מסד בדיקות תחת כוונות התאימות וזיהוי שייכות בסל מעמדות מתוך משפחת מבחנים המרחפת סביב משמר אזורי הגדרת תנאי מידות מסוג (RBAC) | 7.4, 8.1 |
| RBAC-02 | עובד במעלת שכבת היררכיית מנהל ברמת שירות פנימית שההדפסה תרשום לו מעמד אדמין (An admin) קונה ביכולות ומסוגל לברוא ולקבץ נתוני משתמש חדש ולהקימו כיצור פעיל שמוקצה ומושתל בעד רכיבי המערכת בכינוי העסקה מסוג נתון ה-`user` אולם מקבל כתמורה עונש מכת מחסום סירב ממעמד פניית הדלת על הודעה סגורה בעלת הוכחת ביטול דחייה תחת מניעת ההתראות המוכרת בשם המספר המייצג שמופיע כקוד ← `403` בשל נסיונו הכושל ליצור מסמך חיים למרכיבי הצבת ישות הקמת משתמש מורם מעם העובד תחתיו במערך משלים של הכנסת דמות חדשה מסוג יציר ברמה זהה לשלו בתור הרשאת ה-`admin`; לעומת הפעלה אצל רמות השליטה הראשיות בה קצין פיקוח במעמד על מסוג סופר-אדמין עליון שולט ומסוגל בקלילות להקים גוף חי שייצג מתן יכולת פתיחת חיים לחבר עמית בעמדה לזהות כמו ה-`admin` | הוכחת צליחות מוכרעת בהבאת עדות מדוקדקת מטעם משקוף מעבדת בדיקת הפעלות רובוטיות מובהקות הנמצאות בסביבה תחת חסות משדר נבחני תעודה בסביבת צירוף פקודה של ה-Auto ובשילוב שחופף למערך סורק מעשה אדם מנוסה בבדיקות דפדפן (Manual) | 7.4, 12.4 |
| RBAC-03 | חבר צוות במעלות תפקידי עזר של כיתוב השם כמנהל בתור אדמין (admin) מורשה וכן בעל יכולת מותרת על מנת לעדכן צעדי פתיחה לאימון ביצירה עבור פקודות שמקיימות צירוף שמוסיף משתמש להוספת תרגיל חדש במערך הניהולי (add) וכמובן רשאי גם לערוך נתונים בפונקציונליות השמורה למתן שירות כזה השמור לראשי רשומות בעריכה של תוכן קטלוג מקורי הנשען על משאב פנימי תחת מאגר משפחות מאגדי פקודת השיפוץ הכוללת יחס (edit) למשימות על אודות אופי הנתונים הנלווים אצל היסטוריית הקמת היסוד שבונה ומרכיב הגדרת תרגיל רשמי בתצוגת חומר (an exercise), אבל מוצא וסופג החזר מענה מדחיקת כוח הרחקה הפוסלת וממדרת באלימות תחת ענישה כמו שורת אימות למסר הרחקת המזהה בהודעה מסוג הפסילה בדחייה הדוגלת בחוק קוד אזהרת כניסת ← `403` בעת שהוא נתקף יצר ושולח ידו להתעסק בזדון אודות יומרה וניסיון שמנסים לקדם מלאכות נטישה באסכולות מחיקת תכנים ששייכים לתכונת חקר שאישורה מוקנה בסילוק רשמי לחלקת פריטי תיעוד פסיקה להשמדת מסגרות תוכנם אצל תרגיל יחיד בסדרה עוקבת של השמדה במנגנונים מתוך משאבי הגנה למניעת פגיעת אובדן שגורם להעלאת פעולות הרס כדוגמת קבלות החלטת פליטות מיגור מול מהלכי חיסול בישות מוחקת בממשק ההרשאות החסימה של זכות הרשאת מחיקת ה-deleting לעבודה מול עצם השארת מחלקת הפריט במונחי הריסת מערכי קטלוג למערך העומד בציון (an exercise), או שסופג מחסום בוטה במקרה דומה בפגישה מול הפעלת מסלול מחיקה נגד פרט העומד בפני הרחקה על גורם משתמש כגוף (a user), וקל וחומר עונש כדחייה מול פלישת מגע אל גוף אימוני משתמש אנונימי מתוך החוץ מול חלקת רכוש של מישהו שהוא לחלוטין אדם אחר (another user's session) | העמדה כעדות שזכתה להשגת ציון בדיקות ורישומן מתוך מבחנים הכלולים תחת מעטה פיקוח על אמינות אוטומטית שנקרא מסלול בידוק מחשבתי באגף ה-Auto יחד ומתחת אכסדרת יחסי הביקורות לעולמות הכיסוי המותווה בסרגל בוחן הקבוצה המקיף של משטחי כוח איוש מסגרות מחלקות קבוצות החקר של מערכת ההשגחה בסדרת השירות של מערכות ממשק אבטחת מנגנוני ה-RBAC | 7.3–7.5, 8.1 |
| RBAC-04 | עובד במעמד חבר רגיל (A user) נוחל ומוצא דחיקה בסיווג פוסל מענות הדף פליטה בכוח החסם הקורא ← `403` כל אימת שהוא מעמיד משלוח פניה שמציג מגע בבקשת אימון שליטה בפניית פעולות צד השרת אשר משתמשות כביכול בניסיון נתיב בעל עריכה על המקומות מהמונחים הקרויים תחת מילות התג המזהות בשורת הנתיבים המגיעה בתצורת `PUT /api/trainings/:id` ובמקביל מתקיימת העדרה מול אפיקי הראות וספיגת עיוורון באגפי ההנהלה אל סרגל העזר מול יכולת מראה הכפתורים בכך שניכר למעשה שאיננו מבחין בצדו ואיננו מסוגל כלל בשום אופן לראות את התצוגה בעלת כפתור המעניק זכות הרשאת מגע בהכנסת שינוי מסוג של מהלכי גישה בכפתורי כלי הוספת ביצועים בהליכי צעד פתיחת עריכה מוענקת בתור (Edit button) שקופה וחסויה מעיניו במופגן במסכי העיון בלוח הקטלוג המשותף | ראייה נאספת בשירות צוות מבדק המכיל הזרמות ידע ביומן הקצה בעולמות של משגיחי רובוטים קפדניים הלוכדים סימוני איסוף דרך ביצוע מערכת בסיוג הפעולה על עדות למתחם הרצות מחשוב מתזמן מהרכב סמלי אישור הבדיקה על פי הקוד המסייע בעקיפת מבחן שמכיל הרצה מקצה פנימי כמו תכנית בדיקה בסביבות החישוב ה-Auto ביחד ומלווה בתוספת ידנית המפנה איתור ממצאי פתרונות לאבחון ואימות מסמכי התצוגות למבחן במערך דפדפן (Manual) | 7.3, 12.1 |
| RBAC-05 | לקוח בסטטוס החבר במשתמש (user) ובצוותא איליו גם פועל פנימי אדמין מקביל נתקלים בחסימה ומקבלים דחיית עמדות תחת הודעת המראה בעוצמת מסר הסירוב מתוך הצבת ← `403` בשלבים הקשורים לתהליך שידור במשאב הבקשה המבקשת ליצור תנאי הגשת קבצים לפקודות שמשתתפות ביכולות המוגש בסגנון של חדירת אשכול ביוזמות הצבה בשמירת ה-`POST` כלפי היעד על כתובת קווי המאגר שבנתיבי `api/options/muscle-groups`; אלא שרק כאשר יעמוד אל מול השער ניצב מסוג דרגות העליון בשידור מהפקיד מסוג הקצין בשררה על שם הישות הגבוהה בסופר אדמין הוא יהיה הבלעדי אשר ישיג ויקבל נתיב מוכשר במציאות מעבר פתוח שחוזר במסר מחויך באפיק מוצלח של הודעת קבלת ההצלחה החלקה עם האישור כמו פקודת ההזנה מתוך ← `201` | שירות מענה מהבודקים שנסמך על כלי אוטומטי מבוקר בשליחות המייצגת ערוץ צורת פעולה בתצורה במילה המזהה פעילות מספק במחלקת הנתונים באפיק הפלט דרך הערוץ תחת הודעת מערכת מהמרשם למנגנוני הגדרות בדיקות הקבלה ב-Auto כחלק מפקודת מבחנים תחת מטרייה מסוג העמדת עקרונות הרישוי המוגדר בסיוג ל-RBAC | 7.2, 8.1 |
| RBAC-06 | אדמין בסמכויות עריכת פיקוח נורמטיבי מסוגל לבצע מחיקה וממש מצויד בהרשאות להפעיל ולהסיר תיעוד רשמי במחיקת סעיפי מעקבי פעילויות ופיקוח פרי התוצרת למסמך שמציג אימון ששייך ועומד באמתחתו העצמאית לחלוטין (delete their own session), תוך העלאת פעולה מסיימת במקרה זה למציאות קבלת שורת סטטוס חזרה באישור מסוג פקודת הדחייה הפתוחה המוסכמת ומובנת דרך עמידה על תצורת הסיווג המסמל עבודת מניעת הצבת הודעות של → `204`, ויתרה מכך העמדת אפשרות קיומו לתצוגת עבודת קצה שמשלימה מידע בפועל באזור קיום המשטח של פעילויות הכפתור המצהיר קריאה לחסל במילה שעונה להגדרה כעין של כפתור כדוגמת "מחק" (הכרת הלחצן המקובל בהעמדת Delete button) נגלית ומוצגת באורח קבע על גבי מסכי שדה הצגת הפנים שמצטבר בתוכן של מגרת רשומות כרטיסי תצוגה אשר נמצאים בבירור אצלו תחת חלוקתו בקלפים וקיימים בשייכות נחלתם הבלעדית לו לעצמו למאגר העצמאי (on their own cards) | השגת ראיות מחזית המערכת במלאכה שנקראת בשמה כאוטומטית ביישומה של הזרמת פרויקט (Auto) בחברות תעודת הכשר מצד ביקורות המאפיינים למשתמשי בני האדם הבודקים את צידו הוויזואלי ונגישותו לחיצה בפועל ועל ציר המסך דרך פעולות מבדק הבנויות להפעלת מנגנונים הנעים אודות הפעלה במרשם פעולות הקליטה מצד צדדי הלקוח (Manual) | 7.5, 11.4 |
| RBAC-07 | אדם במעמד רישום כגון משתמש בקצה (user) מסוגל ומותר לו בעליל בפעולתו לבצע מחיקה רשמית בממדי הסרת קבצים שקשורים לפעולת ענייני חסכון וליקוט אימון עצמי אישי שהוא שלו לבדו בבלעדיות, ולעומת זה יחווה חסם ויספוג מענה קשוח שמטיח בפניו החזרת פלט של דחייה מקוונת המסרבת ודוחה בעוצמה בציר הודעה בתור דחיית הרחקה בסיווג שמחזיר → `403` ברגע שהוא יפלוש מנגד וישים את עיניו והישגיו אל עבר ניסיון למחיקה שחורג לתחומו בשדות אצל השייך לרשומות ההיסטוריות שעומדות ונשמרות אצל אדם עלום ומנותק הקשור לסביבת אחר כלשהו שאיננו הוא בעצמו (on someone else's) | הרצה שמסתמכת אל הליך איסוף מידע מסיכום כתיבת בדיקה שנשמטה ממסכי מחשב מהירים ששמורים להדפיס נתונים אל מכלול הרצת טכנולוגיה עכשווית העובדת ללא כלי נשק של אדם המקודדת לממדי שחרור כמו הפקת אות בקריאה לפרופיל סביבת בחינה כמו פקודת ההכוונה הקבועה תחת Auto ומנוהלת אקסלוסיבית מכיוון מתחמי כיסוי ההיררכיה שבציוד הרשאות האכיפה מבית ה-RBAC | 7.5, 8.1 |
| RBAC-08 | דרג של סופר-אדמין ברשותו זכות בלתי מוגבלת המסוגלת לבצע חתירה למחיקה ללא סייג ולשלוח נתיב מוחק כלפי כל פריט או רשומה בכל אימון משתמש, יחידת תרגיל קיים, או הכלת נזק מקיף עד למשתמש עובד, אך זאת תמיד למעט מחיקת עדות של ניסיון אובדני למחוק את קיומו העצמי החי שלו עצמו במערכת (but not themself) מכת נגד כזאת על פעלולי ההתאבדות העצמית תחזיר דחייה מידית בסיווג מחמיר נגד התנהלות איום שמשדרת באזהרה והגבלה חדה במסר תווית הודעה כקוד ← `400` | תיעוד מורכב ואמתי ממבדקי הוכחות בשטח על שתי קצוות הפרויקט במיזוג כוחות של בידוק פקודת פנים של מערכות מיכוניות עצמאיות אוטומטיות עם הגדרת נתוני אבחון כגון Auto במקביל למבחן מעבר נבחני סורק ידי אדם הפוקד פריסת שדות צד משתמש בעזרת גיבוי בעבודת מערך ניסוי הבדיקה האנושית באכיפת הגורם מול Manual | 7.3–7.5, 12.5 |
| RBAC-09 | תצוגות מנגנון הממשק שולט ודואג לכך שהן מעלימות בפועל ומסתירות היטב מן הראות באופן חלק את כל כפתורי לחצני הבקרות והאפשרויות השמורות עבור הצעת הגשת ביצוע פעולות מעבר שמערך תפקיד הפעיל (a role) פשוט נטול כל הרשאת גישה כדי לאפשר לו מסוגלות לבצע ולהוציא אותן באופן לגיטימי כלשהו מן הכוח אל הפועל | השלמת סבב מידע ותיעוד סקירות שעברו מול הצגה בעין ויזואלית לאימות הפעולה בעצמה על גבי אורך הצגת עמדות הקצה אצל הלקוח בהשפעת תאימות לבחינה האנושית באמצעות בדיקות החוויה האמיתית אצל בדיקת Manual תוך חובת הפקדה וציות מול מעבר מורחב ספציפי של הדמיית כניסה אל מערכת הבדיקות בתיק החוויה אל תפקיד שמשחק כל תפקיד בסדרת חקירת מקבץ הרשומים ככל שלוש המעמדות תחת השורות של שלושת המקרים עצמם בהרשאה (all roles) | 11.4, 12.1–12.5 |
| RBAC-10 | אדמין וסופר-אדמין יכולים להפעיל ולכבות את **כלול שריפת קלוריות (Include calorie burn)** בתרגיל אירובי; משתמש רגיל אינו יכול (`403`) | אוטומטי (RBAC) + ידני (Manual) | 7.3, 8.1, 12.2 |
| DM-01 | הפעלת אישור של מנגנון קריאת חשבון בירור מאמצים המצויד בפונקציה של `calculateEffortScore()` הפועל במסד המרכזי מטיח נסיונות ומזניק פקודת חריגה על תגובות של סוג שגיאות כזריקה במצב הרצה (throws) עת מנסים להעמיסו לפעול על ישויות מוצקות מעולמות התיעוד בבסיס כדוגמת `Training` ועל מחלקות תואמות מהמכלול העליון בסדר השיוך ל-`BaseSession` והוא נכתב ונדרס בהצלחה כהגדרת מחויבות מחודשת בפועל בחוק (overridden) תחת הצבות אכיפה שמצויות בלבן של שתיהן מתוך הרכבות אבני התקן שיורשות ממנו בענפי מערכות מסלול הבנייה בתתי-המחלקות של משפחת האימונים (both session subclasses) | תמיכה במסד של מבדקי ההשקפה על מערכי בדיקה אוטומטיים באמצעות הפקת תוצר הפעלת מחשבי הקצה הפנימי בניסוי תחת מילה שמאמתת פונקציונאלית את מטרת התאימות ביעד הקוד מסוג הניסוח כ-Auto, לצד הפניית איתות לאותות מחושבים המגיעים מבדיקות מקבוצת בניית החלק המציץ על תאימות מרכיבי מודלים (Models) | 3.1–3.3 |
| DM-02 | קודי מספר חתימות עמדת קיומו של זיהוי (IDs) המשתקפים לנתוני תיעוד ברשומות האימון מצד מנגד מול שדרת מספרי אימות מזהים המשתבצים כזיהוי על פי התיוג למסד נתונים השייך לתרגיל מקטלוג תוכניות במערך המקור מצויים ונמצאים בחלוקת יחסי גומלין אקראית אשר מהווים כיחידות של עצמאות בלתי תלויות (independent) ללא זיקה מפריעה; כמו כן משתני סדר גודל הזיהוי (IDs) לא מפסיקים להתעדכן כהלכה וקורמים הליכי פיתוח עקביים על ציר ההמשך בצבירת יכולות שיעורים הנמצאים באופן תמידי בעליות בספירה המתקדמת כחוק ובצדק יחד מול חזרת ציר עליה שגדל בהתמדה תחת קו מגמת עליות במאגר אפילו לאחר כוח השהייה במונחים שעולים תחת החלת הפעלה מחדש בעמדת מצב התנעת אתחול מן הפתיח של שרת שעבר חידוש סמכויות הזרמה דרך הפעלת עקרון אכיפה מחדש במילים של (server restart) | עדויות בידוק המוצקות בתיעוד חיווי עמדת מצד מכלי ניסוי אוטומטי שזורם עצמאי בתוצאה המיועדת בשם פסיק התיעוד כגון פקודת משמר הבקשה השייכת לערוצי אוטומציה מתוך תוכנה עוקבת מסוג (Auto) יחד בצירוף סקירה מקיפה מצד משקיף ומבקר מפעיל בעזרת ידיים בממדי פקודת גוף המבחן שסורק מול המסך בצורה פזורה כגון העמדת סיוע על פעולת בקרת המשתמש באיוש בדיקות Manual שיקפיד לבצע ולהוכיח עובדות בעת בדיקת חישוב מקרית תוך יצירת מסלול בדיקות בזמני תרחיש להפעלה שמלווה שחזור הרצת רשת שעברה דריכה אל שלבי חזרה לפעולה באתחול תחת מהלך בדיקה על שם פקודת האיפוס כמו במילת נתון אודות סקירה של צלילים במסלול קביעה המורה לבדוק חידוש בתבנית מצד חזרה במסלול מסוג הפעלת (restart) | 3.2, 4.3 |
| DM-03 | רף מידות תחשיבי קלוריות מהמופעים על אימונים קלוריים במידה לפעילות מסוג תרגילים מקבוצת האירובי (Aerobic calories) תואמים ועומדים בדקדוק על פער של השוואה אדוקה בהצגת תוכן תואם שמתואם בשלמות ממש על פי סעיף פקודות מערכות של חישובי חקר הפנינה אל הנתונים מהמודל של שורות ערכי עקבות הטבלה הקיימת תחת רשומה המכונה במאגר בנספחי ציון מקבילים עבור מיקומי כניסת המקור בסעיף האם מ-§3.4 עבור כל פעימה הקשורה לכל סוג פעילות באשר היא; יחד במקביל עולה בחקירה והגשה תפוקה במרכז שנושא יעד למדדי הניקוד שהגיע מטעם מאמץ הפקודת של אימונים מהכוח (Power score) שם תמיד הערך בסכום המוחזר יימצא בחישוב מדויק שהוא באמת שווה ותואם בדיוק להכפלה המשולשת והמוחלטת של שרשרת אלמנט כזה הכולל הכפלת משתני → `sets * reps * weight` | צידוק לממצאי העדויות עובר בדיקה מדוקדקת מטעם משקוף מעבדות ניסוי וקבלת אישורי מחשב למבחנים מיכוניים במחלקת השמורה למושגים הלוכדים אותות מצב בדיקת תקינות מנגנון ההרצות (Auto) בנוסף על ידי פקודת בדיקת כוח תחת ביקורות קבוצות ייעודיות באיוש מסלול בודקי חישובי מחלקות של Calories, והליכה מקבילה בתהליכי מערך צד מודל ביסוס בניית התאמות מחלקות אל מערכי אפיון התוכנית בעלי קצוות ההגדרה מול ה-Models | 2.2, 3.3 |
| DM-04 | נתוני רשומות הזנה פגומה במרכז מקורות בקלט שמובל במידע לקוי ושגוי מעיקרו כגון קליטת מידע דמיוני בעלי נחיתות בעייתית (Invalid inputs) על שגיאה נפוצה בהדגשת אומדן מחוץ לתחום כמסר מחרוזת מול שדה ספירה במספרי חזרות לדוגמא: (`reps: "abc"`), וכן גם שדה הפעלת מדידת מקום נתוני נשימה בפער עמוק מחוץ לדרישת הטווח כמקסימום המותר בתרחישים כהכנסת מצג דרישה לשבירת מחסומי מעטפת הקיבול הנדרש בקביעות כמו העברת שדה שמציג מהירות כזו: (`speed: 16`), בנוסף עמידה על תרחיש ספיגת מסר דחייה מוחלט כאשר פני הפלט כולל הבאת נתונים זרים בעניין הקשת תקופות אודות מאורעות זמן למראה פניה של אישורי העמדת תאריך שמורה לעתיד להתרחש טרם זמנו (a future date) מופקעות ודרושות בעליל להשיב ולהשליך מסר בעל קריאת דחייה של קוד הודעת מענה כמו קוד התראת סיווג תקלה שזכתה להערכת סעיף שדורש דחייה כמו ← `400` ולצד התשובה יוקרן מיד על גבי שטח התצוגה במשטח פנימי המוטמע בטופס (inline error) קו שגיאה של מחרוזת הבעיה באורח ויזואלי המציין התראה על כל בעיה בשדה מתאים. | סמך אישורים למצוין קורם עור וגידים ועולה על בסיס מנגנון צירוף אכיפות כפול ומוצלח הכולל התקנה משותפת החל מירידה להצגת נתוני בדיקה בממשק פקודות ביצועיות סמויות במנוע בדיקת המכונה (Auto) כלוויה מועילה אל מערכות ההתנסות מסימולטור המבוקר בחסויות הידניות שמציג נסיין אנוש בקו מופעים (Manual) | 5.4, 11.2 |
| DM-05 | אימונים של תרגיל אירובי שהאפשרות **כלול שריפת קלוריות** מופעלת בו מכילים `calories` השווה לקלוריות שלהם לפי §3.4; בכל שאר האימונים `calories: null`; הפעלה או כיבוי של האפשרות אינם משנים אימונים שכבר נרשמו | אוטומטי (Models, API routes) | 3.3, 7.3, 7.5 |
| UI-01 | מערך התצוגה הקובע להקמת מסך על מתחם התיבות במדור טופסי הכנסת יצירת נתונים השייך לבסיס משתמש על מעמד כוונות הגשת הטופס המייצר נתונים לעדכוני עבודות כגון מערכות בבסיס העבודה של (The Add form) יגיב מידית בפונקציונליות שמבצעת חילופין הממיר ומעביר את שדות ההזנה החשופים בקליטה בפני הלקוח שלו בכל עת במקרה ובו מתרחש מצב זיהוי שזיהה תנודה שמגיעה מהעברת החלפת יסוד העדפת הגדרת הסוג הכללי והקובע (when the type changes), וכן יעבור להפעלת תהליך בו הוא קורא ומציג מסך הכולל שורות מאובזרות בעמודת מתן חזית נתונים שמצביעות לצורך כיווץ או פריסת מידע בתוך משדר הזרמת פקודת העמדת נתון למסלולי הרמת אזור עבור אפשרות השיפוע כמו (incline) או הצגת אפשרות המראה תחת משדר על ענף העבודה לנתון קו מגמות התנגדות הנקרא בסביבת פעילויות העבודה מול משאבי השפעה כמו ה-(resistance) תוך הסתמכות מלאה והיקף תלות תואם בהתאם לעליות סרגל הצריכה בבקשת הרשומות הנגזר ונופל מן הקצה הנבחר בהחלטות שקשורות בבחירת סיווג המשתנה של אופי הפעילות (depending on the activity) | גיבוי עדויות שמסתמך ומעניק הבטחה קיומית לחלוטין במסלול סרק יחיד ללא תלות אחרת הפועל ומסתובב סביב אפיק יתרון שמסופק רק בידיה של סקירה על פעולה מתמשכת ומודעת מצד מסע התנסות בעקבות מעשה בוחן האדם היושב בקצה האמיתי שמקליד וחווה אודות מבחני הממשק בפיקוח מסווג ופזל לחלקות בדיקות הדוגלות בתקנים בדרכי (Manual) | 11.2 |
| UI-02 | קביעת חוקיות העיצוב בתשתיות קווים שנותנים נראות על השדות עבור דרישות בחירות במקרים אודות פרטי השתלבות שרירים בעמדת מסגרת בשם סביבת הנתון לקביעת ה-`muscleGroup`, קביעת כיוונוני מעבר בשדה עזר לפקודת קביעת דרגות הרמה ומאמצים מסוג `difficulty`, קטגוריית מערך החקר אודות כיווני פעולה לבחירת תחום ה-`activity`, תחום הצהרת גווני הסוג והאופי בחבילת משמעות הגדרת נתון המגדיר פתיחת ה-`type` יחד וכמוהו משבצות הלוכדות עמדת מקבילים בעבודת שייכות הגדרות מן ההיררכיה באגף המסלול תחת סעיף קביעה בשם של משתנה שמגדיר ייעוד נתוני אופי העסקה במערך לזהות תפקידים במסלול ה-`role` - כולם תמיד חייבים להתגלות בפועל מול משטח המסך אך ורק בתוך שימוש על מבנה בתבנית שמקבל עיצוב קצה בתצורה סגורה ומוכתבת מראש ברוח הצגת רשימת תיבות נפתחות המותאמות בגלילת הופעות למארז בעל מאפייני פריסת אבזור בצורה העטופה עם סממני תגי אלמנטים הבנויים מתחת לראות המשתנה הידוע כמגן במתחם מסוג אלמנט יצירת רשימה שנבחר בקו של תיבות פקודות בשם ה-`<select>` וזה מוכרח להיות מיושם באופן שיטתי בכל טופס מבין שדרות החלונות השייכים לבקשת תוכן והכוונה המוקמות לרישומים במסכי פתיחת טפסים כלליים במערכת יחד במקביל עם אותו חיוב יסודי התקף במציאות עמידה ללא שום הבדל של יישום גם כן כל אימת שמגיעים לערוך משהו בסיוע שימוש ועיצוב משטח שמבוצע בצורה של התערבות מקוונת מלווה בסביבת שדות לעריכה ישירה על מרקם כרטיסיות מתוך נתונים השוכנים בסביבה להפעלת עדכונים ב-inline edit | חיווי עדויות תלוי ותומך בקיום נחרץ ומבוסס באופן עיקש סביב אפיק הפקת ידע ממצא סייר הבודק העוסק ומטפל במסמכים שמתגבשים בהוכחות עדות רק תוך סבב מחקר על יסוד פעלול מעקב בעקבות ציר של שדות מבחן בטבעת מבחנים על קריאות מערך הבקרה הקרויה אצלנו כמסך דיווח בעל נגישות על יד העומדים במלאכת הגדרות הידוע בכינוי הפשוט בתור בדיקה ממקרי הבודק ה-Manual | 11.2, 11.4, 11.5, 12.2, 12.4 |
| UI-03 | שדה הפעלת מדידת טווח הזנת דרישות קלט לבקשות קריאה על מנגנון מהירות הקצב בעד עבודה תחת גלילת משתנה (speed input) נבנה וערוך עם מעטפת חסימה המסרבת ולא תקלוט בשום פנים הזנת מערכי פניות שמצטברים בתוצאה אשר מצהירה ומכילה אומדן מחוץ לתחום שעובר במלוא עזות מעל פסגת התקרות של הערכים החורגים מסוג נתוני מקסימום שמייצג כהגבלה קצויה כעין מספר השובר הרשאות בגישה חופשית לעבר מעבר ודילוג על קו מידה רף גבול העמדה שסומן בתווך של השלמות עד - 15.5 | העמדת סימוכין מוגשת מנתוני שירות הנציגים בחקר של קורות מבחני אדם שיערוך סקירת יכולות הפעלות במערך הנגישות בפרקי מעבר של צוות בודק בשם פקודת עובדות מעבדת ביצוע הידוע מתוך ענפים בעלי הזרמות במבחנים עולמיים בסגנון משתמשי הרשת הפורייה כמו קריאות במבחני Manual | 11.2 |
| UI-04 | שמות הקרויים בכינויי משמעות הקצאה לפריטי הגדרת שם עבור מגוון התרגילים הפועלים ומותקנים לאורך סביבת מערכות האפליקציה (Exercise names) מאופיינים לחופש פתוח באופן שאינו מכיל משמר הגבלות מוגדר על תיקוני איות והן מרחבים להחופשיים שזורמים במסדי הרשאה המעניקה עולם מלא בזכות החזקת יכולות בעל אופי נתונים הקיים לעד בצורה הכללית העונה לחקירת חלל משטח של טקסט חופשי (free text); כאשר נתונה קריאת העדפה להכוונות פנייה על שדרת הבחירה השמורה להחזר של מידע בעל הקמת מצב במילה המחריגה על הפקת אלמנט בחלופה כמו **"אחר…" (Other…)** תעלה יצירה לחיווי גילוי מקטע מסגרת להזנת שדות טקסט כבקשת פניה אל אזור שקורא תחת קלט קליטה לעמדת הפקודת שדות מידע תחת העדפת משתנה מסוג - text field, והפניית הבחירה אל שאיבת גורל שמפעיל העדפה שתצביע בייצוג עבור כל אלמנט של חתימת קוד משתנה לבחירת אפשרות אחרת כלשהי ממנו פשוט מחביאה ומיד מעלימה ברוח סילוק אקטיבי את המראה שלו ועד כי היא דואגת ומוחקת לחלוטין ניקוי פנימי שימחק בריקון סדר של השארות התוכן אצלו פנימה באותה מידה (clears it) | חתימות הבאת תעודה לעדויות מבחני התאימות מתורגמת לאישור בגין ביסוס פקודת איסוף מידע שמגיעה בסיוע ממדעי מעשי הקוראים לבחון ולקבל השלמה בייצוג הנגיעה והחקירה למבחני דרישה הממוקדת בפעילות מגע סייר העוזר המופעל ומפשפש באמצעות כלים בסקירות של תוכנית עבודת הצוות מול הניסיונות של החוקר החי במסלול הבדיקות של Manual | 12.2 |
| UI-05 | רישומים כגון התערבות טקסט בלתי שגור בשפת המקור והזרת תכנים שמכילים ניסוח כתב במלל מחרוזת הנטועה תחת צורת מלל ושפה שאיננה נמנית באסכולת הקריאה אל קבוצות סגנון המאפיין צירופי טקסטים הנהוג בסגנון טקסט שונה משפת חברות תצורת השפות האנגלית (Non-English text) בעת שיורכב כניסיון שימוש במצב המכונה מול שדות החריגים המצפים למציאת עולם רשומות בסיווג פקודת אזור הקלט המוערך לכינוי של **"Other…"** יוביל תרחיש כשל המציג מסר התראת תיקונים העדכנית על המקום בעבור הגולש שמזהירה מידית בדמות המלל המעיד אזהרת כתיבה שמתריעה כי על עליו לנקוט בהעדפה ללשון הבקשה כמו *"השתמש באותיות באנגלית בלבד"* (Use English letters only.) ובמקביל תנועת הזרם משדרת פעולה אחורית ששולחת עדכון אל אזור מערך שרת המטרה אליו נורה תוכן השדר כאשר בעצמו גם ידחה זאת כליל וישיב במענה פקודות תקן חוזר המכיל שגיאה קשה באות סיווג מקיף למענה מסוג הדחייה של ← `400` | הוכחת אישורים ניתנת לעדכון במציאות שפונה לחקר הראיות תוך שיתוף של מאמצי אימות כפולים בסיוע חישוב אל מאגרי סיור הלוכדים סימונים כצוותי שליטה העורכים ניסוי בסיווג הפעולה מהקצה האוטומטי בתחום סביבת כלי המחשוב ה-Auto במקביל ותוספת השקעה של מסלולי ניסויי הקלקות תחת יסוד בדיקות מהצוות האנושי אצל צד הבקרה הנבדק למסכי Manual | 5.3, 12.2 |
| UI-06 | במסגרת כובע השימוש בתור מנהל מערכות הנראה ורשום על רקע קביעת קבוצות משתמשי הרשאה תחת מעמד במילה המרכזית כמו אדמין (As an admin), אקט ושמירה על מהלך שנענה באחריות על תיקון מסוג הפעלת צורכי עבודה עם החלת מיקום הזרמת שמירות אל עדכון לתוך ערך זר מסוג חדש השמור בקיומו להתווסף אך ורק בסעיף הכתיבה המוצג במילים כמו כהגדרת רזרבה תחת חריג העונה למילה מסוג של הקריאה כ **"אחר…" ("Other…")** מציג באורך פלא עבור המשתמש קבלת פנייה שתעיד עמדת תצוגה במסך הודעה שמשדרת הערה פנימית בלבד (inline note) שנושאת מלל הקרוב ברוחו לבקשת שימור וביטחון על ציר מילות הדיווח אודות ידע שכבר הוכרז שפעולה זו *"נשמרת עבור התרגיל הזה בלבד…"* (Saved for this exercise only…), בליווי סגירה שלא תוציא הופעת בקשה להתראה מהנהלת האפשרויות החיצוניות ופתיחה בסגנון קו בקשות לעולם האפשרויות כמו הצצות (with no prompt) | השלמות לבקרה הופקו תחת יומן הנתונים וקיבלו מצע לעדויות מהימנות באמצעות שרשרת סיכומי עדויות שעוברים בהצלחה במכונת אישורי בידוק משוכללת השייכת לרובוט סיוע הבוחנים הראשי תחת אגפי סידור מבדק של כוח חישובים באוטומטי כמו Auto (על מסלול בניית מבדק תחת מנגנון סריקת יכולות של כיוון המיקוד על הפעלות פונקציות טהורות בסביבת בדיקת הלקוח ה-Client logic) ביחד לצד משלים המבחנים כסיור של יד הבוחן המסייע מצד בדיקת העיניים כדוגמת עורכי התכנית לבדיקות מחוויית הלקוח באות של בדיקות קשורות למגע פועלי אכיפת עבודה מן הסביבה של מסדר פעולות ה-Manual | 9.6, 12.3 |
| UI-07 | בסגנון עבודת נרשם העולה למסך במעמד הגדרות דרג תחת סיווג תפקיד קו האצולה הנעלה אצל מנהלי הליבה מסוג חברי ממשק המכונה (As a superadmin), מהלכי תיעוד לשמירת המידע בעד הצגת שיפור עובדות שנושא נתון שזה עתה יצא ונקלט בתור כתוכן המהווה מרכיב ערך חריג וזר מסוג ערך מידע התחדשות שמופיע ומובא למערכת כעדכני מול כינויים על הגדרת שימוש אל תוואי מילות החריגות שנחקק כגון **"אחר…" ("Other…")** יזניקו למקום מסכי פלט שמציגים הודעת מראה שנוטה להתערב בתוצרי חלונות שמגיעים דרך קפיצת בקשת חלון הופעת פנים מתרחבת שתבקש עצה בהמשך (shows the inline prompt); כאשר סימון חיובי אל ערוץ ההחלטה על משבצת האומרת במפורש כן (Yes) דואגת לחיבור הפקודה לצרף ומוסיפה בעקבותיה את תוסף האופציה ישר לתוך ערימת האפשרויות שבתוך כל תפריט בחירות (every select), ומשליכה במקביל נתוני תיעוד שנשמרים כמאובטחים לצמידות התחזוקה ומיושמים אפילו ולאחר מקרים שנגזרו מפקודת חידוש במסכים שרצים במחזור על פקודת ריענון מהשרת (also after a reload); לעומת הנגד לחיצת וקבלת הסתייגות ממצב המהלך בלחיצה לעמדת לא (No) נועלת מהלך ומותירה באופן חופשי את הרשימה במצב הקבוע (leaves the list unchanged) כאשר במקביל התרגיל עצמו מקבל רשות פתוחה שמשמרת את הערך ההוא בגפו למען עצמו יחד בלבד | צירוף מערכי הוכחות לדיווח בא ממדעי משימת בדיקה והשגחה העוסקת בלמידה פרקטית על הצד של חוויית העין במסע על מערכות משדר הבדיקות וכל גילוי חשיפותיהן דרך מקור פעולות הציוד המיועד לעורכי עמדות מבחני יד הבודקים בחוויית רשת חיה כמו כתיבת המבדקים בשדות עמדת בדיקת הפעלות מהכינוי המוכר על שדה שקוראים לו Manual | 12.3 |
| UI-08 | העברת הקלדת רצף אודות ידע שכבר הוכרז ופגש מופעים מהעבר שמרכיבים הכנסות של אלמנט המשמש נתון על העמדת סעיף אפשרות קיימת כבר מן העבר במאגר רשת רשומות (לדוגמה העברת משתנה זהותי מסוג ערך ידוע ממערך שרירים קיימים כמחרוזת "Legs") אל מתחת סביבת הזנת מרחב משתנים שמוגדרים במעמד הקריאה החריגה אל כינויים למילה **"אחר…" ("Other…")** לוקחת ועושה שימוש קבוע באופציה זו הישנה באמת מן העבר וללא שום הופעת עליות של בקשת מתן הצהרת חלון שאלות אישור מאיים לצרכי הגדרת הרשאות מיותר ונוסף כזה שבמקום של מענה על התראה עתידה להצגת החזון החתום במוסכם מראש כלא דרוש בתיק במילים: מונע הקפצה של הודעות ושידורים מנועים המופיעים כסיווג צרכי הצגה בסוג הליכי החלונות מהבסיס כעין מסר של כניסת בקשות כמו (with no prompt) | השלמות לבקרות נתפסו יחד תחת תיעוד מקרי ההוכחות לממשק וקיבלו חיזוק בעדויות מובנות במסע מדויק בעזרת אשכול כוח רובוטים פנימי הנדון ומכונה לבקשות שירות בדיקה כפוף במסלול אצל מחשוב פקודות האכיפה המכונה כמתכונת מילת האוטומציה שבאגפי שיבוצי תחומי הפעלת בדיקות שורת מסך של שידור מחסומים (Auto) במקביל להשגת אישור תוקף בהרכבת בדיקת מחלקת כללי בדיקות התפקוד בחקר לוגיקת סביבת עבודה קפדנית השוכנת תחת ה-Client logic וזה צורף בתמיכת סיירים שעוסקים גם בתאימות מצד סיורים של הלקוחות שנוגעים במבנה מציאות הדברים מול אכיפת פעולת אדם כמתוארת מראש בתור בדיקה שנשאבת לחוויית משתמש דרך מנגנון המוכר בביטוי לעבודות Manual | 9.6, 12.3 |
| UI-09 | הרצת הליך שמטרתו מעבר ועריכת נתון של שורת פעולת עריכה העוסקת בסיווג יחידות למופעי הפעלות על איבר רשום בקטלוג כמו פריטי סדר תרגילים מסוג עבודה של תרגיל כוח אשר קבוצת השרירים שמשויכת אל מיקומה איננה כלל מסווגת בארגון המאגר ונמצאת נעדרת כליל אצל רישומי נתוני סרגל פאנל כל רשימת האפשרויות, פותחת ומרכיבה את חלון תצוגתו לחוויה בה האפשרות הזרה קורצת לאימות ומוצעת עם הכנסה מלווה תחת הגעה לסעיף בחירת חלון קבוע מהאופציה למילה מסוג של תווית הקרויה במונחי סימול מראש לביטוי האומר אל רכיב תווית על דרישות "אחר…" (Other…) כאשר זו מצויה נבחרת וערוכה ומוכנה מראש תחת הנתונים המסווגים שרצים לעבר בחירה כמושג העומד פתוח אליהם בסידור מקדים (pre-selected) ויחד לצידו מופע מלא ומעודכן הכולל גם מילוי בפועל של השדות להקלדת שורות במערכת (filled in) בנתונים המדויקים המקוריים | העדויות מוכחות למבדקים על פני צירי מערכת תקינים נמסרו לאחר צילום הישגים ממערכות בדיקה שהוענקו דרך משלחת קצוות צוותי אכיפה המקפידים לנהל פעולות שבודקות קבוצת יסוד של מהלכי חקירה הנערכים בידי משטחי גולש ידני ומצטרפות ליישומי הפיקוח שמנווטות בהגדרת פקודות ללקוח המקצועי דרך גורמים כמו כתיבת המבחנים בהשלמה על יד אדם במרכז פעילות המיון במילה העונה לסגנון של מעשים תחת מילון העבודה במסמך כמו כינויים מסוג עמדות ביקורת ה-Manual | 12.2 |
| UI-10 | הפעלת אישור ביצוע שמקדם עריכת נתוני מעבר בסעיפי הגדרת הפריט במוקד תרגיל שריר קיים איננה באה במגע ולא משנה את נתונים מקובעים מהקופסה שעבר עליהם גלגולי משלוחים אודות נתוני היסטוריות פריטי עבודה אצל אימונים ורישומים קודמים שכבר התקבעו (logged) ואוחסנו ונצברו תחת שיוכם בסעיף מול השורות הרשמיות של אותו התרגיל המוערך שמולו קוימה (doesn't change sessions already logged against it) | גיבוי עדויות מוכחות לתיעוד הבדיקה נקרא להראות יכולות של עמדות נכונות באמצעות כרייה בתוצאות הבקרה דרך קבוצת בידוק אשכול הפונקציונאלית על השדרות המחזיקות צוות בוחנים מתקדמים ונטולי עייפות במחלקת הבחינות מיכוניות שבמרחבי כלי העזרה במונחי עזר תחת מטרייה מסוג מעבדות תחת סדר אוטומטי במרוץ כמו כוחות (Auto) עם התאמה אל אשכולות פריסות קצוות ההגדרות כמו על הניתוב שבמעמד העמדות בקובץ של מערך מסדי מבחני נתיבי קצה לתיאום קווי הרשת תחת מסלולים באגף (API routes) בהשלמה צמודה שמצריכה מגע בעת כוננות למילוי הראות גם מעבר בעקבות השטח ומבנה המראה החיצוני במבדקים תחת הגדרות ביקורות הידע על צוות פועלי אכיפת עבודה מן הסביבה של מסדר שקורא לשמו בתור מנועי ה-Manual | 7.3, 12.2 |
| UI-11 | מכלול קווי הפעולה במסנני הפילטרים משתלבים יחד בצורה מורכבת לעמדת קבלות החלטות מאוחדות שמשתמשות ופועלות במשולב בהתאמה מדויקת ובאופן יציב (combine correctly), ויכולות הגדרת סידורי זווית בחלון העולה עם שימוש של ביצוע המיון (sorting) פועלות אקטיבית וניחנו באפשרויות על צמד שני פסי הכיוונים האפשריים המדוברים (in both directions) בעבור כל כלי אשכול של חתכי הפרופיל לשירות של בחירה העוסקת גם בכתיבת תאריך, סדרי תיאום מיקום תחת שמות שורש המובנים בשמם וציון קו מאמצי הערכה בתוצאות המצופות במקור תחת ההבטחה כמאמר התקן שמעניק מילוי פריט עבור כל תו מתוך ניקוד רמת עומסים ל-effort | ממצאי תעודות קביעת שירות אישור של מבדקי ההצלחה מתוקפים באמצעות סיורי מעקב שחקר והתמצה על ידי ביקורות אוטומטיות מהכלי לסיקור המידות שמחולק ומקצועי תחת אינדיקציות מערכתיות מקודדות תחת מסלול בניית התיק כראוי במנועי המנגנון החשאי (Auto) יחד בצירוף הצגת מחקר על פונקציות העבודה על ההיגיון השמור לחבר קו תצוגת הבחירות הקיימות באסכולה של מחלקת הבדיקות השוכנת לחקר קפדני (Client logic) ובאותה נשימה מתואמת היטב אף הוכחה דרך כוח גיבוי של המאמצים במשימות מעבדות מסך האדם שיצר בקרה בשימוש בעין וחקר מעשים באמצעות הפעלת ידיים בביטוי למסור בדיקות מצד הבדיקות תחת הרצת אגפי מערכי בחינות שדה בכינוי השגור בשמו כקוד פעולות של מבחני עמדת המצב שמצוינת בתיאורי ה-Manual | 9.3, 11.5 |
| UI-12 | פעולות גישה לעריכה המופיעה על סדר ציר שורת התצוגה המקוונת בסמך המילה שמקרינה מגע של קביעה עריכת רשת (Inline edit) שומרות ומקבעות התקנה שמתעקשת באדיקות להנכיח הידוק מאגר אמין לאכסון מובהק השורד דיסק במלוא היקף הקיום באמינות כמו השתת התחייבות רציפה לשמירת רעננות במילון בשם הרצת מאמר רציף הנשמר וחי כמו ביישום העזר בשמירת גיבוי למאגר (persists), בנוסף על פעילות כפתור אישור הוידוא המוצב שבאמצע פקודות ההרשאות החולשות קרוב על ציר מקרי התצוגה בעת מתן אזהרות הסרה שמספקות הגנות של פניית חיסול והשמדה בפקודות כמו פונקציית פניית אימותי בקשת סילוק ומחיקה בזרם הראשי הקיימים בעמדה לצדו (inline delete confirmation) כלי שמשכנע ומוכיח שהוא מתפקד כראוי על תילו ועושה פועל ולוכד מצב כליל עמידה תחת צמד היכולות השרירות להפגין כי אכן זה מביא ביצוע המקיים ועונה בכבוד להשפעת הממצא כראוי (works) | כל מעמד התהודות לעדויות קבלה מסופקות דרך מרכז תוצרי התיעודים המופקים בהופעות במדדים ממשיים המגיעים למבחן התנסות מחוויית הפעולות תחת מקומות השייכות לגזרות מסירת אשכול קווי דוחות אצל עמדות שירות במעטפת הופעה הנבדקת אנושית בעין על בסיס מנגנוני מעורבות קרובות ממשית במונחים שעולים תחת החלת הפעלות מהשגחה מסוג בדיקת צד המשתמש ה-Manual | 11.4 |
| UI-13 | כל סדרת קבוצות ארבעת (4) הסטטוסים שמוקצים עבור נתוני סטטיסטיקות האפליקציה בצירוף מניין שעולה והפך לחבר במקהלה עם מעורבות לא פחות מכמות המכילה סך פלטים מספריים של 4 הבחנות שיצאו כמשפטים חכמים ומועילים במסד שמשכלל מסרים תחת המשתנה של שורות התובנות (insights) שניהם חייבים לעבור תהליכי ארגון המעניקים חותמות עדכונים על תגובה נמרצת ומתעדכנים פנימית בהבזק רענון קריא שעומד בפקודת שרטוט מחדש להזנת רענונים במדויק ופועל בכל השלמה מהירה שהיא לאחר התרחשות מצב הזרמת יעד עם עדכוני כניסות המביאות תנודות המוגדרות תחת תצורה שהיא למעשה לאחר קיום בכל מהלך של שינוי מזהה כגון במקביל כללי השינויים (after every change) וכן נדרשים לגלות מידות רגישות בהליכי טיפול ותגובה נאותה מסודרת שכוללים כוח אבטחה וכיסוי מול חריגים תחת עמדת הצגת גישה מאופקת שיודעת איך להתנהג ולטפל ולתמוך מול מתקפות נסיון בהעמדת שדרות ריקות כאשר מידע תוכני כזה עובר בסוגיות הענקת פריט מצד מגישים המייצגים ספקי חורגים הנגועות בהזנת מאגרים המרוקנים וחסרי הצדקה כראוי תחת ציון כדוגמת עליות בסגנון הגשת משאבים רצופי תוכן פגום בחסר או במונח ה-empty data | גיבוש אימות מסופק ומובא לידי מיגור על ידי מנגנון שרתים מאובטחים הניתן ונתמך בתשתית מנועי בוחן מתקדמים במסלולים רובוטיים מדויקים בשדרות אוטומציה סמויות ממבחני הלוח (Auto) תוך משטח הכלת נתונים ספציפי של מקלדת הבוחנים הטהורה ממעבדות תחת לוגיקת סביבת עבודה קפדנית ה-Client logic וצרוף פקודה של הבאת תעודות אישור מצד מבטי צוות הבודקים תחת מתכונת המוכרת בהגדרת הפעלות יד הבוחנים תחת מנגנון המכונה במאגר קודי ההרצות בשם קבוצות עריכת יד הלקוח כמו המוסבר במדד עין של Manual | 9.4, 9.5, 11.6 |
| UI-14 | ארכיטקטורת הבסיס השייכת להצבת כיוונוני מתאר העדפת הפריסה המסדרת את נראות כל אופן שילוב פסי התצוגה המוכרת כמו מערך ארגון התצורה שמרכיב דפי הצגה כעין לוח סדרי יעד פריסה בעל אופי התנהגות השומר אל העיצוב בתפיסה המבנית שעונה והמכונה פריסת סקיצות מערך הבניין של צדי המסך בתיאורי ה-layout מתאימים ופועלים בתהליכי עבודת סידור ראויה שמתקבעת ומוצגת למופת בטבעיות זורמת והולמת היטב (works) עבור מגוון עולמות גדלי הרוחב אשר נעוצים במדדי 375, גדלים המורחבים בכניסות לכדי מצבי אומדני הצפי של ה-768 ואפילו עד הרחבות שכיחות למידות שרואים בשדות נתוני משוואות הפרוסים בכוח ממדי כתיבה המסכמים עמדות ומידות ה-1280 px | השגת הוכחות ביצועיות מטעם הצהרת בדיקות יד אדם שנסרקות תוך כוננות מחקרית בפעולות יזומות שמתמחות מתוך קצוות גופם על דפי גלישת משתמש אמתי אכן הוכיחו היערכות מקדימה ומסירות בעמידת תהליכי בירור סמכותיות תחת סביבת רכבי המאפיינים שבתוך עריכת מקרים ממשית בפלט מתוך יסוד עולם של כללי תהליך ניהול מבדקים הנקרא בראשי תיבות בשם בדיקות שמדמות הרצה המוכרת בעולמות הפיקוח כסיווג צדי בסיסי של צופים החשופים בקריאה לכינוי Manual | 13.1 |
| UI-15 | אפס עקבות הימצאות או הופעה שכיחה מעידים בבדיקה ומאשרים קיום נתון שמוודא שאין כלל כיתוב כמענה מחרוזת קבועות הנשתלת בקוד עבור כלי המוכר בשמירת אלמנט דפדפן הקרוי אל מאגרי צירופים תחת חוק `localStorage`, רשויות של פקודות סדרי אכסון שורות לזמן אורך כניסות כמו מערכת ה-`sessionStorage`, שירות הקשור ומכונה תחת קוד מחרוזת מנגנון העדפות העוקב לעבר רצועות תיעוד מקובל בדוגמת רכיבי הקליטה באצירת קבצים כגון שם המופיע בקו של תרשים הפקודה תחת הכותרת אל `document.cookie` ואפילו לא נכלל בסמך משאבי תחקיר סקריפט התפעול שימוש תחת הגדרת הופעות צורות החלונות השואלים פניות צצות כמחסום שעוטות שדרות סמכויות ה-`alert(` המופיעים במסמכים לאורך ורחבי הסביבה כולה אל מקום בסביבה החשופה שמקומה כקוד תוכנה במיקומה של תוכנית יצירות במאגר האתר בתיקייה ששם השורש שלה סווג בקובץ תחת הציון בספריות הקרויות `client/` | עובדות סקירת המידע מתקיימות באמצעות הליך מתקדם ומהיר אשר רץ בעין וקולט יכולות איתור לוכדי חיפושים קפדניים שמשתמשים בהבזק כלי הצימוד השגרתי מפקודות הניהול הלינוקס מתוך מאגרי טכניקות מציאת קביעות במילים המסופק במילה עזר על מערך הכלים ובעל המונח שמצייר כמעבד פקודת רכיב בשירות הפעלות המוכר היטב בסיווג של ← grep | 13.2 |
| UI-16 | תיבת הסימון **כלול שריפת קלוריות (Include calorie burn)** מופיעה בטופס התרגיל רק עבור תרגילים אירוביים, וכרטיסיות של אימונים שנרשמו כשהיא מופעלת מציגות "≈ X kcal" | ידני (Manual) | 11.3, 12.2 |
