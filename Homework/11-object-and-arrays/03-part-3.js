//3.1
const inventory = [
  { item: "Laptop", price: 1200, quantity: 5 },
  { item: "Mouse", price: 25, quantity: 50 },
  { item: "Keyboard", price: 100, quantity: 20 }
];

const sumPrice = inventory.reduce((sum, item) => {
    return sum + item.price * item.quantity
}, 0)

console.log(sumPrice);

//3.2
const people = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 30 }
];
// Expected Output: { '25': ['Alice', 'Bob'], '30': ['Charlie'] }

const peopleByAge = people.reduce((acc, person) => {
  if (!acc[person.age]){
    acc[person.age] = []
  }

  acc[person.age].push(person.name)

  return acc
}, {})

console.log(peopleByAge);
