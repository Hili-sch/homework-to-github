//Exercise 1

let person1 = {
  name: "Hili",
  age: 44,
};

console.log("person1:", person1);

let person2 = person1;
person2.age = 32;

console.log("person1:", person1);

let score1 = 85;

console.log("score1:", score1);

let score2 = score1;
score2 = 100;

console.log("score1:", score1);

// התשובה לשאלה היא שבמשתנה פרימטיבי הערך מועתק בשלמותו למשתנה
// ובמשתנה רפרנס כמו אובייקט הערך לא מועתק אלא רק נוצרת עוד הפניה למשתנה הראשון
// ולכן כל שינוי ישפיע על הערכים במשתנה ולא משנה מאיזה קישור היה השינוי


//Exercise 2

let a = "15";
let b = 10;
let c = "2";

console.log(b + a); //1015
console.log(b + + a); //25
console.log(Number(a) + b); //25

console.log(a * c);

// התשובה לשאלה כי השפה מבינה שאין צורה להכפיל בסטרינג וממילא זה הופך אותו לנמבר


//Exercise 3

let secretMessage = "Hello";

if (true) {
  let secretMessage = "Goodbye";
  var hackerMessage = "I am inside!";
  console.log("Inside block: ", secretMessage);
}

console.log("Outside block 1: ", secretMessage);
console.log("Outside block 2: ", hackerMessage);

// תשובה לשאלה, מה שמוגדר ההגדרה ב"לט" (כתבתי בעברית בשביל הנוחות של ימין ושמאל) מוכר רק בתוך הבלוק
// ומה שמוגדר "ואר" מוכר בכל הקוד ולכן כשהגדרנו משתנה בבלוק ל"לט" המערכת לא הכירה אותו מוחץ לבלוק
// וכן השינוי שנתנו בתוך הבלוק רק יצר משתנה חדש שאינו מוכר מחוץ לבלוק


//Exercise 4


const mixedValues = [0, "hello", "", null, 42, undefined, NaN, "false", [], {}];

for (let i = 0; i < mixedValues.length; i++) {
    if (mixedValues[i]) {
        console.log(mixedValues[i], "is truthy");        
    } else {
        console.log(mixedValues[i], "is falsy");        
    }
}

// מחזיר true
// הסבר: רק דבר ריק מוגדר פולסי (סליחה על העברית)
// אבל מערך ריק עצם המערך זה אובייקט התופס מקום בזיכרון