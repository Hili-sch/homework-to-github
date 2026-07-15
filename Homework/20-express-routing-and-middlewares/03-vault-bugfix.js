import { Router } from "express";

const router = Router()

const requireCode = (req, res, next) => {
    try {
        if (['A1', 'B2'].includes(req.body.code)) {
            res.locals.access = 'granted'
        } else {
            res.locals.access = 'denied'
            res.status(401).send('Access denied')
        }
        next()
    } catch (error) {
        res.status(500)
    }
}

router.post('/', [requireCode], (req, res) => {
    try {
        res.send(res.locals)
    } catch (error) {
        res.status(500)
    }
})


export default router