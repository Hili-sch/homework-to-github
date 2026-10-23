import { getNumber } from "../utils.js";


const randomInt = getNumber(100, 1000)

console.log("sum minute is:", randomInt);

const hour = Math.floor(randomInt / 60)
const minute = randomInt % 60
console.log("hour is:", hour);
console.log("minute is:", minute);

console.log(`${hour}:${minute}`);

