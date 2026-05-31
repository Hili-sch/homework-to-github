import { getInteger } from "../utils.js";

const koter = getInteger(10, 40)
const depth = getInteger(10, 40)

console.log("koter is:", koter);
console.log("depth is:", depth);


const radius = koter / 2
const area = Math.PI * radius * radius
const volume = area * depth

console.log("The capacity of the pot is:", volume);
