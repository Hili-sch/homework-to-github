import { getInteger } from "../utils.js";

let averageClass = 0;

for (let i = 0; i < 100; i++) {
  let sumGrads = 0;
  for (let j = 0; j < 10; j++) {
    const gread = getInteger(20, 100);
    sumGrads += gread;
    // console.log(`gread ${i + 1} is: ${greade}`);
  }
  const averageStudent = sumGrads / 10;
  averageClass += averageStudent;
  console.log(`Student ${i + 1} average score is: ${averageStudent}`);
}

console.log(`The average grade for the class is: ${averageClass / 100}`);
