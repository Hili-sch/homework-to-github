const matrix = []

for (let i = 0; i < 10 ;i++) {
    matrix.push([])
    for (let j = 0; j < 10; j++){
        matrix[i].push(i * 10 + j)
    }
}

console.table(matrix);
