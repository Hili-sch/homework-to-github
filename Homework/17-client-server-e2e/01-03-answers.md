## שאלה 1 (הועתקה ל-server)
* המערך צריך להיות של נמבר ולא סטרינגים ובלי גרשיים על המספרים
* אפשר גם להמיר מערך לסטרינג כך 
```js
const result = users.filter(u => ids.includes(String(u.id)))
```
## שאלה 2 (הועתקה ל-02-bug-fix)
* השורה החסרה
```js
import express from 'express'
const app = express()

app.use(express.json())//<<<השורה החסרה

app.post('/search', (req, res) => {
  const { name } = req.body
  res.json({ found: name })
})

app.listen(3000)
```
## שאלה 3 (הועתקה ל-server)
```js
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
```