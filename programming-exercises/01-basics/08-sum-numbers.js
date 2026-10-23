import { getInteger } from "../utils.js";

const randomInt = getInteger(10, 99)

console.log("number is:", randomInt);

const sum = randomInt % 10 + Math.floor(randomInt / 10)
console.log("sum numbers is:", sum);
