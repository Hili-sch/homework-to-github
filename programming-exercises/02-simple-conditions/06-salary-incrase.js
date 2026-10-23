import { getInteger } from "../utils.js";

const employeeName = "anonymous"

let salary = getInteger(4500, 35000)

console.log(`the salary for ${employeeName} before uploading is: ${salary}`);

if (salary <= 6000) {
    salary *= 1.1
} else {
    salary *= 1.05
}

console.log(`the salary for ${employeeName} after upload is: ${salary}`);
