## Exercise 5
* code:
```js
const stepOne = (req, res, next) => {
    res.locals.trail = 'start'
    next()
}

const stepTwo = (req, res, next) => {
    res.locals.trail = res.locals.trail + '-middle'
    res.locals.count = 2
    next()
}

app.get('/journey', [stepOne, stepTwo], (req, res) => {
    res.json(res.locals)
})
```
* return:
```json
{
    "trail": "start-middle",
    "count": 2
}
```