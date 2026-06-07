const matrix = []

for (let i = 0; i < 10; i++){
    matrix.push([])
    for (let j = 0; j < 10; j++){
        matrix[i].push(Math.min(Math.min(i + 1, j + 1), Math.min(10 - i, 10 - j)))
    }
}

console.table(matrix)