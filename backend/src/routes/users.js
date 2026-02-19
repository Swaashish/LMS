const express = require("express")
const router = express.Router()

const { BookModel } = require("../models/book")
const { UserModel } = require("../models/user")

// ===============================
// Helper: Remove password
// ===============================
const omitPassword = (user) => {
  const { password, ...rest } = user
  return rest
}

// ===============================
// Get all users
// ===============================
router.get("/", async (req, res, next) => {
  try {
    const users = await UserModel.find({})
    return res.status(200).json({
      users: users.map((user) => omitPassword(user.toJSON())),
    })
  } catch (err) {
    next(err)
  }
})

// ===============================
// Register
// ===============================
router.post("/register", async (req, res, next) => {
  try {
    const { username, password, role } = req.body

    if (!username || !password || !role) {
      return res.status(400).json({
        error: "username, password and role are required",
      })
    }

    const existingUser = await UserModel.findOne({ username })
    if (existingUser) {
      return res.status(400).json({
        error: "Username already exists",
      })
    }

    const user = await UserModel.create({
      username,
      password,
      role,
    })

    return res.status(201).json({
      user: omitPassword(user.toJSON()),
    })
  } catch (err) {
    next(err)
  }
})

// ===============================
// Login
// ===============================
router.post("/login", async (req, res, next) => {
  try {
    const user = await UserModel.findOne({
      username: req.body.username,
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (user.password !== req.body.password) {
      return res.status(400).json({ error: "Invalid password" })
    }

    req.session.userId = user._id

    return res.status(200).json({
      user: omitPassword(user.toJSON()),
    })
  } catch (err) {
    next(err)
  }
})

// ===============================
// Logout
// ===============================
router.get("/logout", (req, res) => {
  req.session.destroy()
  return res.status(200).json({ success: true })
})

// ===============================
// Profile
// ===============================
router.get("/profile", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.session.userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.status(200).json({
      user: omitPassword(user.toJSON()),
    })
  } catch (err) {
    next(err)
  }
})

// ===============================
// Borrow Book
// ===============================
router.post("/borrow", async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn })

    if (!book) {
      return res.status(404).json({ error: "Book not found" })
    }

    if (book.borrowedBy.length === book.quantity) {
      return res.status(400).json({ error: "Book is not available" })
    }

    const user = await UserModel.findById(req.body.userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (book.borrowedBy.includes(user._id)) {
      return res.status(400).json({
        error: "You've already borrowed this book",
      })
    }

    book.borrowedBy.push(user._id)
    await book.save()

    return res.status(200).json({
      book: {
        ...book.toJSON(),
        availableQuantity:
          book.quantity - book.borrowedBy.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ===============================
// Return Book
// ===============================
router.post("/return", async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn })

    if (!book) {
      return res.status(404).json({ error: "Book not found" })
    }

    const user = await UserModel.findById(req.body.userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (!book.borrowedBy.includes(user._id)) {
      return res.status(400).json({
        error: "You need to borrow this book first!",
      })
    }

    book.borrowedBy = book.borrowedBy.filter(
      (borrowedUserId) =>
        !borrowedUserId.equals(user._id)
    )

    await book.save()

    return res.status(200).json({
      book: {
        ...book.toJSON(),
        availableQuantity:
          book.quantity - book.borrowedBy.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ===============================
// Borrowed Books
// ===============================
router.get("/borrowed-books", async (req, res, next) => {
  try {
    const result = await BookModel.find({
      borrowedBy: { $in: [req.session.userId] },
    })

    return res.status(200).json({ books: result })
  } catch (err) {
    next(err)
  }
})

// ===============================
module.exports = { router }
