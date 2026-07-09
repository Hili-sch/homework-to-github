import express from 'express'
const app = express()

app.use(express.json())//<<<השורה החסרה

app.post('/search', (req, res) => {
  const { name } = req.body
  res.json({ found: name })
})

app.listen(3000)