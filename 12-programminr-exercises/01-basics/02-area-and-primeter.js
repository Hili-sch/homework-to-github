import { getNumber } from "../utils.js";

const length = getNumber(21, 40)

const width = getNumber(5, 20)

console.log(`length: ${length}, width:${width}`);

console.log("area is:", length * width);

console.log("perimeter is:", length * 2 + width * 2);


