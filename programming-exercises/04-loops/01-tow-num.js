import { getInteger } from "../utils.js";

const num1 = getInteger(0, 30);

const num2 = getInteger(0, 30);

console.log("num1 is:", num1, "num2 is:", num2);

for (let i = Math.min(num1, num2); i <= Math.max(num1, num2); i++) {
  console.log(i);
}
