import { getInteger } from "../utils.js";

const num1 = getInteger(1, 100);
const num2 = getInteger(1, 100);

console.log("number 1 is:", num1);
console.log("number 2 is:", num2);


if (num1 > num2) {
  console.log("grow is:", num1);
} else {
  console.log("grow is:", num2);
}
