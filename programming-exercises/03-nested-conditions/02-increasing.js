import { getInteger } from "../utils.js";

const num1 = getInteger(1, 50)
const num2 = getInteger(1, 50)
const num3 = getInteger(1, 50)

console.log("number 1 is:", num1);
console.log("number 2 is:", num2);
console.log("number 3 is:", num3);

if (num2 > num1 && num3 > num2) {
    console.log("Increasing");    
}