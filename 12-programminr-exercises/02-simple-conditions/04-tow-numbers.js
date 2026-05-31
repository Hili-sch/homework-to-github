import { getNumber } from "../utils.js";

const num1 = getNumber(1, 20);
const num2 = getNumber(1, 20);

console.log("number 1 is:", num1);
console.log("number 2 is:", num2);

console.log(num1 % num2 === 0 ? "First number is divided by second number." : "The first number is not divisible by the second number.");
console.log(num2 % num1 === 0 ? "Second number is divisible by first number." : "The second number is not divisible by the first number.");
