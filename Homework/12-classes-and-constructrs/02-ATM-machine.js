class ATM {
  static totalTransactions = 0;

  constructor(bankName, initialBalance) {
    this.bankName = bankName;
    this.initialBalance = initialBalance;
  }

  #verifyPin(pin) {
    if (pin === "1234") return true;
    console.log("Wrong PIN");
    return false;
  }

  #updateBalance(amount) {
    this.initialBalance -= amount;
  }

  #printReceipt(amount) {
    console.log(`Receipt: withdrew ${amount}. Remaining: ${this.initialBalance}`);
  }

  withdraw(pin, amount){
    if (!this.#verifyPin(pin)) return

    if(this.initialBalance < amount) {
        console.log("Insufficient funds");
        return
    }

    this.#updateBalance(amount)
    this.#printReceipt(amount)
    ATM.totalTransaction++
  }
}

const bank = new ATM("pohalm", 100000)

bank.withdraw("1234", 500)
bank.withdraw("4564", 5000)
bank.withdraw("1234", 8500)
bank.withdraw("1234", 9870)
bank.withdraw("1234", 987000)