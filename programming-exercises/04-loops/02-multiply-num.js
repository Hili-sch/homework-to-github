import { getInteger } from "../utils.js";

const num = getInteger(1, 30);
console.log("number is:", num);

let multiplay = 1;

for (let i = 1; i <= num; i++) {
  multiplay *= i;
}

console.log(multiplay);
