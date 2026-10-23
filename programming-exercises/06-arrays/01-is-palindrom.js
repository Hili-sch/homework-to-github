const arr1 = [2, 4, 6, 8, 6, 6, 8, 6, 4, 2];
const arr2 = [2, 7, 6, 8, 6, 6, 18, 6, 4, 2];

function isPalindrom(arr){
    for (let i = 0; i < arr.length / 2; i++){
        if (arr[i] !== arr[arr.length - 1 - i]) return false
    }
    return true
}

console.log(isPalindrom(arr1));
console.log(isPalindrom(arr2));
