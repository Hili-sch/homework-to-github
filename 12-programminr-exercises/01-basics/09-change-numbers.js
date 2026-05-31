import { getNumber } from "../utils.js";

const num = getNumber(10, 99)

console.log("number is:", num);

const result = num % 10 * 10 + Math.floor(num / 10)

console.log("change is:", result);
