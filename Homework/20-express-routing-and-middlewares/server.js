import express from "express";
import requestId from "./01-requestId.js"
import vault from "./02-vault.js"
import vaultbf from "./03-vault-bugfix.js"
import club from "./04-members-only-discount.js"
import tril from "./05-tril.js"

const app = express();

app.use(express.json());
app.use("/vault", vault)
app.use("/vaultbf", vaultbf)
app.use("/club", club)
app.use("/tril", tril)


//תרגיל 1
app.get("/store/:id", requestId, (req, res) => {
    try {
        const itemId = req.params.id;
        const response = {
            itemId,
            status: "available",
        };
        console.log("the locals res obj:", res.locals);

        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
});



app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});