import { getInteger } from "../utils.js";

const num = getInteger(3, 50);

console.log("number is:", num);


let sum = 0;

for (let i = 3; i <= num; i += 3) {
    console.log(i);
    sum += i
}

console.log(`sum number to ${num} devid un 3 is: ${sum}`);
