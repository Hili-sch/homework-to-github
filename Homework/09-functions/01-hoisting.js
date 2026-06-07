

add(5, 8)

multiply(4, 8)

function add(num1, num2) {
    console.log(`${num1} + ${num2} =`,num1 + num2);
}

const multiply = function(num1, num2) {
    console.log(`${num1} * ${num2} =`, num1 * num2);
}



//Hoisting הכוונה 'הרמה' , משתנה פונקציה בג'אווה סקריפט מקבל לפני הרצת הקוד, הרמה כאילו הוא כתוב בראש הדף.
// בשונה ממשתנים אחרים שהמערכת מכירה אותם רק כשהרצת הקוד מגיעה לשורת ההצהרה