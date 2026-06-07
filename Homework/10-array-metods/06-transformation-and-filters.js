const products = [
  { id: 1, price: 20 },
  { id: 2, price: 50 },
  { id: 3, price: 15 },
];

const expensiveProducts = products.filter((obj) => obj.price >= 20);

console.log(expensiveProducts);

const ids = expensiveProducts.map((obj) => {
  return obj.id;
});

console.log(ids);
