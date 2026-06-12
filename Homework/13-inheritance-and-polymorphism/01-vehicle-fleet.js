class Vehicle {
    
    constructor(brand, speed) {
        this.brand = brand
        this.speed = speed
        this.running = false
    }

    start(){
        this.running = true
        console.log(`${this.brand} engine started`);
    }

    stop(){
        this.running = false
        console.log(`${this.brand} engine stopped`);   
    }
}

class Car extends Vehicle {
   
    constructor(brand, speed, doors) {
        super(brand, speed);
        this.doors = doors
    }

    openTrunk(){
        console.log(`${this.brand} trunk is open`);
        
    }
}

class ElectricCar extends Car {
    
    constructor(brand, speed, doors, batteryLevel) {
        super(brand, speed, doors);
        this.batteryLeve = batteryLevel
    }

    charge() {
        this.batteryLevel = 100
        console.log(`${this.brand} is fully charged`);
    }
}

const vehicle = new Vehicle("Kia", 140)
const car = new Car("Sienna", 170, 5)
const electricCar = new ElectricCar("Tesla", 250, 4, 67)

console.log(vehicle, car, electricCar);

vehicle.start()
vehicle.stop()

car.start()
car.stop()
car.openTrunk()

electricCar.start()
electricCar.stop()
electricCar.openTrunk()
electricCar.charge()