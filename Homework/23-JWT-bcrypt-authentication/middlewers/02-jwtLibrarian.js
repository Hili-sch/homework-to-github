import jwt from "jsonwebtoken"
import "dotenv/config"
import fs from "fs/promises"


const membersFilePath = new URL("../db/members.json", import.meta.url)

export default async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).send("token missing")
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            console.log(err.message)
            return res.status(401).send(err.message)
        }
        try {
            const { email } = decoded
            const members = JSON.parse(await fs.readFile(membersFilePath, 'utf-8'))
            const member = members.find((member) => member.email === email)  

            if (!member) {
                return res.status(401).send("user not found")
            }

            // Verify that the user is a librarian
            if (member.role !== "librarian") {
                return res.status(403).send("access denied: not a librarian")
            }

            // Store the authenticated member in res.locals
            res.locals.member = member
            next()
        } catch (error) {
            console.log(error.message)
            return res.status(500).send("Internal server error during authentication")
        }
    })
}