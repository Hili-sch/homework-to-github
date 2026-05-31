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
