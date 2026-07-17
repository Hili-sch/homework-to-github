import 'dotenv/config'
import express from 'express'
import jwt from 'jsonwebtoken'
import fs from "fs/promises"


import isEmailExists from './middlewers/isEmailExists.js'
import passwordEncryptor from "./middlewers/01-encrypt-a-library-card-PIN.js"
import passwordDecriptor from "./middlewers/passwordDecriptor.js"
import edit from "./middlewers/02-edit.js"
import bugfix from "./middlewers/04-bugfix.js"

const membersFilePath = new URL('./db/members.json', import.meta.url)



const app = express();

app.use(express.json());
app.use("/edit", edit)
app.use("/books", bugfix)


app.post('/register', isEmailExists, passwordEncryptor, async (req, res) => {
    try {
        const members = res.locals.members
        const member = {
            ...req.body,
            hash: res.locals.hash
        }

        delete member.password

        

        const { email } = member

        jwt.sign(
            {email},
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '60s'},
            async (err, accessToken) => {
                if(err){
                    console.log(err.message)
                    throw new Error('Failed to have token')
                }else{
                    members.push(member)
                    await fs.writeFile(membersFilePath, JSON.stringify(members))
                    res.send({accessToken})
                }
            }
        )
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal server error')
    }
})


app.post('/login', isEmailExists, passwordDecriptor, (req, res) => {
 try {
        const {email} = req.body

        jwt.sign(
            {email},
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '60s'},
            async (err, accessToken) => {
                if(err){
                    console.log(err.message)
                    throw new Error('Failed to have token')
                }else{
                    res.send({accessToken})
                }
            }
        )
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Internal server error')
    }
})




app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});