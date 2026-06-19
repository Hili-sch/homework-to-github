import express from "express";

const app = express();

app.use(express.json());

//=======================================================

//תרגיל 1
app.get("/store/:id", (req, res) => {
  try {
    const itemId = req.params.id;
    const response = {
      itemId,
      status: "available",
    };
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

/*
תשובה: 
JSON:
   {
   itemId: 42,
   status: "available"
   }
status: 200
*/

//תרגיל 2

app.post("/feedback", (req, res) => {
  try {
    const response = {
      received: req.body.feedback,
      message: "Thanks!",
    };
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//תרגיל 3

app.get("/product/:id", (req, res) => {
  try {
    const productId = req.params.id;
    const response = {
      productId,
      inStock: true,
    };
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//תרגיל 4

app.get("/greet/:name", (req, res) => {
  try {
    const name = req.params.name;
    const response = {
      message: `Hello ${name}!`
    };
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//=================================================

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
