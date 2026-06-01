//2.1
const person = { name: "Clark Kent", occupation: "Reporter" };
const powers = { flight: true, strength: "superhuman" };

const superHero = { ...person, ...powers };

console.log("superHero is:", superHero);

//2.2
const calculateTotal = (discount, ...products) =>
  products.map((prod) => (prod *= 1 - discount / 100));

console.log(calculateTotal(15, 10, 50, 70, 100));
