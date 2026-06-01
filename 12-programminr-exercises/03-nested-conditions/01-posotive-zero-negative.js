import { getInteger } from "../utils.js";

const num = getInteger(-10, 10)

console.log("number is:", num);

if (num > 0) {
    console.log("is posotive");
} else if (num < 0) {
    console.log("is negative");    
} else {
    console.log("zero");    
}
