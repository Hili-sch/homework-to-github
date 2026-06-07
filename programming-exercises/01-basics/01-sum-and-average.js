import { getInteger } from "../utils.js";
let sum = 0
for (let i = 0; i < 3; i++) {
    const randomNum = getInteger(100, 999)
    console.log(`number ${i + 1} is:${randomNum}`);    
    sum += randomNum
}

console.log("sum is:",sum);
console.log("average is:", sum / 3);