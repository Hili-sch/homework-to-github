//1
let original = [1, 2, 3];

let copy1 = [...original];

let copy2 = original.slice();

console.log("original", original, "copy1", copy1, "copy2", copy2);

//2
let group1 = ["Alice", "Bob"];

let group2 = ["Charlie", "Dave"];

let allUsers = [...group1, ...group2]

console.log("group1", group1, "group2", group2, "allUsers", allUsers);

allUsers = allUsers.join(" - ")

console.log(allUsers);