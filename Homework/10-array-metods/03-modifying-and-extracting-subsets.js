let months = ["Jan", "March", "April", "June"];

console.log(1, months);

months.splice(1, 0, "Feb");

console.log(2, months);

let newArr = months.slice(3, 5);

console.log(3, "months", months, "newArr", newArr);
