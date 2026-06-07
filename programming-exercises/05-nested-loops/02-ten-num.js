import { getInteger } from "../utils.js";
const arr = []
for (let i = 0; i < 10; i++){
    arr.push(getInteger(1, 20))
}
console.log(arr);

for (let i = 0; i < 9; i ++){
    for (let j = Math.min(arr[i], arr[i + 1]); j <= Math.max(arr[i], arr[i + 1]); j++) {
        console.log(j);
        
    }
}