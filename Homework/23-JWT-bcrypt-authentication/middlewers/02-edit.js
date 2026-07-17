import { Router } from "express"
import fs from "fs/promises"

import jwtLibrarian from "./02-jwtLibrarian.js"

const router = Router()
const booksFilePath = new URL("../db/books.json", import.meta.url)

router.patch("/", jwtLibrarian, async (req, res) => {
    try {
        const { title, bookTitle, id, bookId } = req.body
        const targetTitle = title || bookTitle
        const targetId = id || bookId

        if (!targetTitle && !targetId) {
            return res.status(400).send("Book title or ID is required in the body to borrow a book")
        }

        let books = []
        try {
            const data = await fs.readFile(booksFilePath, 'utf-8')
            if (data.trim()) {
                books = JSON.parse(data)
            }
        } catch (e) {
            // File does not exist or has invalid JSON
        }

        // If the database is empty, initialize it with default books for testing
        if (books.length === 0) {
            books = [
                { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", copies: 5, borrowedBy: [] },
                { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", copies: 3, borrowedBy: [] },
                { id: 3, title: "1984", author: "George Orwell", copies: 2, borrowedBy: [] }
            ]
            await fs.writeFile(booksFilePath, JSON.stringify(books, null, 2))
        }

        let book
        if (targetId) {
            book = books.find((b) => b.id === Number(targetId))
        } else if (targetTitle) {
            book = books.find((b) => b.title.toLowerCase() === targetTitle.toLowerCase())
        }

        if (!book) {
            return res.status(404).send("Book not found")
        }

        if (book.copies <= 0) {
            return res.status(400).send("No copies of this book are currently available")
        }

        const userEmail = res.locals.member.email

        if (!book.borrowedBy) {
            book.borrowedBy = []
        }

        if (book.borrowedBy.includes(userEmail)) {
            return res.status(400).send("You have already borrowed this book")
        }

        // Borrow the book
        book.copies--
        book.borrowedBy.push(userEmail)

        await fs.writeFile(booksFilePath, JSON.stringify(books, null, 2))

        return res.send({
            message: `Book '${book.title}' successfully borrowed`,
            book
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send("Internal server error")
    }
})

export default router