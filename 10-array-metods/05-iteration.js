//1
const students = [
  { name: "John", passed: true },
  { name: "Jane", passed: false },
];

students.forEach((obj) => {
  if (obj.passed) {
    console.log(`${obj.name}'s John's record has been reviewed`);
  } else {
    console.log(`${obj.name}'s John's record has not been reviewed`);
  }
});

//2
let scores = [45, 65, 88, 92, 55];

console.log(scores.find((num) => num  > 85))

//3
console.log(scores.every((num) => num > 40));

console.log(scores.some((num) => num < 50));
