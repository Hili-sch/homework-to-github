//Exercise 1
var movie1 = {
    title: "The Matrix",
    score: 5,
};
var tags = [];
tags.push("action");
tags.push(5);
//Exercise 2
var quantity;
// quantity = "5"                       // A
quantity = 5; // A
var flag;
flag = true; // B
var code;
code = 42; // C
// code = true                          // D
code = "true"; // D
// const list: (string | number)[] = []
var list = [];
list.push("apple"); // E
list.push(true); // F
// I fixed these lines, but in order for the file to run, I commented out the broken code and added a fix instead
// A: A number type should be written as a number without quotes
// B-C: Valid
// D: Is not defined as a boolean value, so I added quotes to it (you can also use the fix from F)
// E: Valid
// F: Like in D, but I fixed it by changing the type to boolean
//Exercise 3
// function calculateTotal(price: number, qty: number, discount?: string): number {
function calculateTotal(price, qty, discount) {
    console.log(discount);
    return price * qty;
}
calculateTotal(10, 5, true);
var config = {
    name: "Store",
    // active: "yes"
    active: true
};
var Dog = /** @class */ (function () {
    function Dog(name, sound) {
        this.name = name;
        this.sound = sound;
    }
    return Dog;
}());
var order1 = 'pending';
function printStatus(status) {
    return "Order is currently: ".concat(status);
}
printStatus(order1);
