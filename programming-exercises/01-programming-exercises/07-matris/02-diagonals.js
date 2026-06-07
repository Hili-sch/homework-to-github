const matrix = []

for (let i = 0; i < 10; i++){
    matrix.push([])
    for (let j = 0; j < 10; j++){
        if (j === i || j === 9 - i) {
            matrix[i].push(1)
        } else {
            matrix[i].push(0)
        }
    }
}

console.table(matrix);
