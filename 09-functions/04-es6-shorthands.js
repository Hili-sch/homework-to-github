// Old ES5 Code - Refactor this!
function createProduct(id, name, price) {
  return {
    id: id,
    name: name,
    price: price,
    getSummary: function() {
      return "Product: " + this.name + " costs $" + this.price;
    }
  };
}

var myProduct = createProduct(101, "Wireless Mouse", 25);
console.log(myProduct.getSummary());

// =====================================================================


// new ES6 Code
function createProduct(id, name, price) {
  return {
    id,
    name,
    price,
    getSummary() {
      return `Product: ${this.name} costs $${this.price}`;
    }
  };
}

const myProduct1 = createProduct(101, "Wireless Mouse", 25);
console.log(myProduct1.getSummary());