import fs from "fs/promises"
const membersFilePath = new URL('../db/members.json', import.meta.url)

export default async (req, res, next) => {
    const members = JSON.parse(await fs.readFile(membersFilePath))

    const member = members.find(member => member.email === req.body.email)
    if(member && req.url === '/register'){
        return res.status(400).send('Email already exists')
    }
    if(!member && req.url === '/login'){
        return res.status(401).send('Email not exists')
    }
    res.locals.members = members
    res.locals.member = member
    next()
}