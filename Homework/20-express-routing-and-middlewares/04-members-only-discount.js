import { Router } from 'express'

const router = Router()

const checkMembership = (req, res, next) => {
    if (req.headers['x-member'] === 'true') {
        res.locals.member = true
        next()
    } else {
        res.locals.member = false
        res.status(403).send('You are not a club member.')
    }
}

const attachDiscount = (req, res, next) => {
    res.locals.discount = res.locals.member ? 20 : 0
    next()
}

router.get('/:id', checkMembership, attachDiscount,
    (req, res) => {
        res.json({
            productId: req.params.id,
            discount: res.locals.discount,
        })
    }
)

export default router