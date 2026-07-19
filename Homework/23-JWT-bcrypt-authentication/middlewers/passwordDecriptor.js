import { compare } from "bcryptjs"


export default async (req, res, next) => {
    const isValid = await compare(req.body.password + process.env.PEPPER, res.locals.member.hash)

    if(!isValid){
        return res.status(401).send('Wrong Password')
    }

    next()
}