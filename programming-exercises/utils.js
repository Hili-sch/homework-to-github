export function getInteger(min = 1000, top = 9999) {
    return Math.floor(Math.random() * (top - min) + min)
}

export function getNumber(min = 1000, top = 9999) {
    return Math.random() * (top - min) + min
}

