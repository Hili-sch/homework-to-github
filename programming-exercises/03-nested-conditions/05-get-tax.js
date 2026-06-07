import { getInteger } from "../utils.js";

const taking = getInteger(10000, 300000);
const freelance = "anonymous";

let tax = 0;
switch (true) {
  case taking < 23000:
    tax = taking * 0.1;
    break;
  case taking < 46000:
    tax = 2300 + ((taking - 23000) * 0.2);
    break;
  case taking < 120000:
    tax = 2300 + 4600 + ((taking - 46000) * 0.3);
    break;
  case tax < 220000:
    tax = 2300 + 4600 + 22200 + ((taking - 120000) * 0.4)
    break;
  default:
    tax = 2300 + 4600 + 22200 + 40000 + ((taking - 220000) * 0.5)
    break;
}

console.log(`${freelance} freelance, taking is: ${taking}, the tax is: ${tax}`);
