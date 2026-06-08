class CarWash {
    static totalWashes = 0
    
    constructor(carModel, washType) {
        this.carModel = carModel
        this.washType = washType//basic, full
    }

    #spray(){
        console.log("Spraying water...");
    }

    #applysoap() {
        console.log("Applying soap...");
    }

    #dry(){
        if (this.washType === "full"){
            console.log("Drying car...");
        }
    }

    startWash() {
        CarWash.totalWashes ++
        this.#spray()
        this.#applysoap()
        this.#dry()
        console.log(`${this.carModel} wash complete. Total washes today: ${CarWash.totalWashes}`);
    }
}

const mazda = new CarWash("Toyota", "basic")
const toyota = new CarWash("BMW", "full")

mazda.startWash()
toyota.startWash()