import { Router } from "express";

const router = Router()

router.post('/', (req, res, next) => {
    try {
        if (['111', '222'].includes(req.body.code)) {
            next()
        } else {
            res.send('Access Denied')
        }
    } catch (error) {
        res.status(500)
    }
})

router.post('/', (req, res) => {
    try {
        console.log('Opening the vault...')
        res.json({ secret: 'The gold is in the basement' })
    } catch (error) {
        res.status(500)
    }
})
//"999" = "Access Denied"
//"111" = "secret": "The gold is in the basement"

export default router