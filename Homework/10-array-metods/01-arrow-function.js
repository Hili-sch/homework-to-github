const person = {
  name: "Pinni",
  age: 23,
  delay() {
    // Arrow function used inside a setTimeout
    setTimeout(() => console.log(this), 4000);
  },
};

const user = {
  name: "Alice",
  // Arrow function used directly as an object method
  greetArrow: () => {
    console.log("Hello, " + this.name);
  },
};

person.delay();
user.greetArrow();


//result:
//PS C:\code\homework-to-github\10-array-metods> node .\01-arrow-function.js
// Hello, undefined
// { name: 'Pinni', age: 23, delay: [Function: delay] }

//הסבר:
//הפונקציה ב'פרסון' מבצעת קריאה לכאלבק,
//כשלתוך פונקציית הכאלבק היא מכניסה את הד'יס שבתוך האובייקט המפעיל אותה
//ולכן הוא מזהה את זה כאובייקט שבתוך 'פרסון
//(ובפונקציית חץ זה כאילו יש ביינד)

//אבל בפונקציה שבתוך 'יוזר' הקריאה אליה נעשית מתוך גלובל
//ולכן רואים ערך ריק, כי אין משתנה 'ניים' בתוך גלובל