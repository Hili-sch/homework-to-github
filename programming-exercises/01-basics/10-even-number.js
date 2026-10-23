import { getNumber } from "../utils.js";

let num = Math.random() * (100 - 1) + 1;

num = num.toFixed(2);

console.log("num ber is:", num);

if (num % 2 === 0) {
  console.log("The number is even.");
} else {
  num = Math.floor(num);

  num += 2
  num -= num % 2
  console.log(num);
}
