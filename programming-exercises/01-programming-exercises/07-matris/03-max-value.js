import { getInteger } from "../utils.js";

const matrix = []

for (let i = 0; i < 10; i++){
    matrix.push([])
    for(let j = 0; j < 10; j++){
        matrix[i].push(getInteger(1, 300))         
    }
}

console.table(matrix);

let max = 0

for (const row of matrix) {
    for (const val of row) {
        max = Math.max(val, max)
    }
}

console.log(max);
