import { getInteger } from "../utils.js";

const matrix = []

for (let i = 0; i < 10; i++){
    matrix.push([])
    for(let j = 0; j < 10; j++){
        matrix[i].push(getInteger(1, 300))         
    }
}

console.table(matrix);
console.log("=============================================");

for (let i = 0; i < matrix.length; i++){
    for(let j = 0; j < matrix[i].length; j++){
        if (matrix[i][j] % 5 === 0 || matrix[i][j] % 7 === 0) {
            matrix[i][j] = 0
        }
    }
}

console.table(matrix);
