import { getInteger } from "../utils.js";

const num1 = getInteger(1, 50);
const num2 = getInteger(1, 50);
const num3 = getInteger(1, 50);

console.log("number 1 is:", num1);
console.log("number 2 is:", num2);
console.log("number 3 is:", num3);

let growNum = num1;
let growStr = "number 1";
let equals = false;

if (num2 > growNum) {
  growNum = num2;
  growStr = "number 2";
} else if (num2 === growNum) {
  growStr = "number 1 and number 2";
  equals = true;
}

if (num3 > growNum) {
  growNum = num3;
  growStr = "number 3";
} else if (num3 === growNum && equals) {
  growStr = "everyone is equal";
} else if (num3 === growNum) {
  growStr = `${growStr} and number 3`;
}

console.log(`number grow is: ${growStr}, becose is: ${growNum}`);
