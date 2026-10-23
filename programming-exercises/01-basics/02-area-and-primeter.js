import { getInteger } from "../utils.js";

const length = getInteger(21, 40)

const width = getInteger(5, 20)

console.log(`length: ${length}, width:${width}`);

console.log("area is:", length * width);

console.log("perimeter is:", length * 2 + width * 2);


