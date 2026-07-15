import { Router } from "express";

const router = Router()

const stepOne = (req, res, next) => {
    res.locals.trail = 'start'
    next()
}

const stepTwo = (req, res, next) => {
    res.locals.trail = res.locals.trail + '-middle'
    res.locals.count = 2
    next()
}

router.get('/journey', [stepOne, stepTwo], (req, res) => {
    res.json(res.locals)
})

export default router