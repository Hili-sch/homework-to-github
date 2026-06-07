import { getNumber } from "../utils.js";

let randomInt = getNumber()


console.log(randomInt);

randomInt = Math.floor(randomInt % 100 / 10)

console.log("sccond right number is:",randomInt);
