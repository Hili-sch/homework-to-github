//1.1
const userProfile = {
  id: 402,
  username: "code\_ninja",
  location: {
    country: "USA",
    city: "Seattle",
  },
  preferences: {
    hobbies: ["cycling", "reading", "gaming"],
  },
};

const {
    username: handle,
    location: {city},
    preferences: {hobbies: [first]}
} = userProfile

console.log(handle);
console.log(city);
console.log(first);

//1.2
const growScores = [88, 92, 100]

const maxScores = Math.max(...growScores)

const otherGrades = growScores.filter(score => score !== maxScores)

console.log(`Grow scores is: ${maxScores}, and the rest is: ${otherGrades}`);

console.log(otherGrades);