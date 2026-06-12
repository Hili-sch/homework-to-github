class PaymentMethod {
    
    constructor(ownerName) {
        this.ownerName = ownerName
    }

    pay(amount) {
        console.log("pay() not implemented");
    }

    receipt(amount) {
        this.pay(amount)
        console.log(`Receipt sent to ${this.ownerName}`);
    }
}

class CreditCard extends PaymentMethod {
   
    constructor(ownerName, cardNumber) {
        super(ownerName);
        this.cardNumber = cardNumber
    }

    pay(amount) {
        console.log(`Charging ${amount} NIS to card ending in ${String(this.cardNumber).slice(-4)}`);
    }
}

class PayPal extends PaymentMethod {
  
    constructor(ownerName, email) {
        super(ownerName);
        this.email = email
    }

    pay(amount) {
        console.log(`Sending ${amount} NIS via PayPal to ${this.email}`);
    }
}

class BankTransfer extends PaymentMethod {
    
    constructor(ownerName, iban) {
        super(ownerName);
        this.iban = iban
    }

    pay(amount) {
    console.log(`Transferring ${amount} NIS from IBAN ${this.iban}`);        
    }
}

const creditCard = new CreditCard("Pini", "12345678")
const payPal = new PayPal("Elazar", "elaz@ai.com")
const bankTransfer = new BankTransfer("Salomon", "Hili")

const paymentMethod = [creditCard, payPal, bankTransfer]

for (const item of paymentMethod) {
    item.receipt(500)
}