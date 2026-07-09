import express from "express"
import fs from 'fs/promises'
import cors from 'cors'



const app = express()

app.use(express.json())
app.use(cors())

//execise 1
const ids = [2, 4]
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 4, name: "Carol" }
]
const result = users.filter(u => ids.includes(u.id))
console.log(result)

//execise 3
app.get('/roles', async (req, res) => {
  try {
    const raw = await fs.readFile('./db/roles.json')
    const roles = JSON.parse(raw)
    res.json(roles)
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Internal server error')
  }
})

//execise 4
app.post("/weather", async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(`${process.cwd()}/db/city.json`))

        const cityName = req.body.city

        const city = data.find((c) => c.city === cityName)

        if (!city) {
            return res.status(404).send("city is not found")
        }

        res.status(200).json(city)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server erorr")
    }
})

//execise 5
app.post("/order", async (req, res) => {
    try {
        const data = JSON.parse(await fs.readFile(`${process.cwd()}/db/order.json`))

        const ordersId = req.body.ids
        console.log(ordersId)
        const orders = data.filter(item => ordersId.includes(item.id))

        if (!orders) {
            return res.status(404).send("order is not found")
        }

        res.status(200).json(orders)
    } catch (error) {
        console.error(error.mesage)
        res.status(500).send("Internal server erorr")
    }
})



app.listen(3000, () => {
    console.log("Echo server running on port 3000");
})