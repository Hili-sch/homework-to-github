import { getNumber } from "../utils.js";

const num = getNumber(100, 999)
console.log("num is:", num );


const hundred = Math.floor(num / 100)

console.log("hundred is:", hundred);
