//Exercise 1

type Rating = number | string;

type Movie = {
    title: string;
    score: Rating;
};

const movie1: Movie = {
    title: "The Matrix",
    score: 5,
};

const tags: (string | number)[] = [];
tags.push("action");
tags.push(5);


//Exercise 2

let quantity: number
// quantity = "5"                       // A
quantity = 5                       // A

let flag: boolean
flag = true                          // B

let code: string | number
code = 42                            // C
// code = true                          // D
code = "true"                          // D

// const list: (string | number)[] = []
const list: (string | boolean)[] = []
list.push("apple")                   // E
list.push(true)                      // F

// I fixed these lines, but in order for the file to run, I commented out the broken code and added a fix instead
// A: A number type should be written as a number without quotes
// B-C: Valid
// D: Is not defined as a boolean value, so I added quotes to it (you can also use the fix from F)
// E: Valid
// F: Like in D, but I fixed it by changing the type to boolean


//Exercise 3

// function calculateTotal(price: number, qty: number, discount?: string): number {
function calculateTotal(price: number, qty: number, discount?: boolean): number {
    console.log(discount)
    return price * qty
}

calculateTotal(10, 5, true)

console.log(calculateTotal(10, 5, true));


const config: { name: string, active: boolean } = {
    name: "Store",
    // active: "yes"
    active: true
}



//Exercise 4

interface Animal {
    name: string
}

interface Animal {
    sound: string
}

class Dog implements Animal {
    name: string
    sound: string

    constructor(name: string, sound: string) {
        this.name = name
        this.sound = sound
    }
}



//Exercise 5

type OrderStatus = 'pending' | 'shipped' | 'delivered';

let order1: OrderStatus = 'pending';

function printStatus(status: OrderStatus): string {
    return `Order is currently: ${status}`;
}

printStatus(order1);

console.log(printStatus(order1));
