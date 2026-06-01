import { getInteger } from "../utils.js";

const num = getInteger(1, 9999);

console.log("number is:", num);

if (num < 10) {
  console.log("the length is 1 number");
} else if (num < 100) {
  console.log("the length is 2 numbers");
} else if (num < 1000) {
  console.log("the length is 3 numbers");
} else {
  console.log("the length is 4 numbers");
}
