import express from "express"
import fs from 'fs/promises'
import cors from 'cors'



const app = express()

app.use(express.json())
app.use(cors())
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
        console.error(error.mesage)
        res.status(500).send("Internal server erorr")
    }
})



app.listen(3000, () => {
    console.log("Echo server running on port 3000");
})