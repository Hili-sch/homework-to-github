import { getInteger } from "../utils.js";

const num = getInteger()

console.log("the number is:", num);

console.log(num % 2 === 0 ? "is even" : "is odd");

