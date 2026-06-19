import express from "express"

const app = express()

app.use(express.json())

app.post("/echo", (req, res) => {
    try {
        const response = {
            youSent: req.body.echo,
            ok: true
        }
        res.status(200).send(response)
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error")
    }
})

app.listen(4000, () => {
    console.log("Echo server running on port 4000");
})