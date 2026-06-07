import { getInteger } from "../utils.js";

const num1 = getInteger(1, 20);
const num2 = getInteger(1, 20);

console.log("number 1 is:", num1);
console.log("number 2 is:", num2);

console.log(num1 < num2 ? `small is: ${num1}, large is: ${num2}` : `small is: ${num2}, large is: ${num1}`);
