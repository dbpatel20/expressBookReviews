const express = require('express'); 
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); 
const regd_users = express.Router();

let users = []; 

// Helper function to check if username is valid
const isValid = (username) => {
    return /^[a-zA-Z0-9]+$/.test(username); // Username must contain only alphanumeric characters
};

// Helper function to check if username and password match
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    return !!user; // Returns true if user is found and password matches
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the user exists and credentials are correct
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, "access", { expiresIn: "1h" });

    // Save token in session
    if (!req.session.authorization) {
        req.session.authorization = {};
    }
    req.session.authorization['accessToken'] = token;

    return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;

    // Check if review is provided
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    // Validate if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const username = req.user.username; // Username from session JWT

    // Add or modify the review
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Validate if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const username = req.user.username; // Username from session JWT

    // Check if the user has a review
    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
    } else {
        return res.status(404).json({ message: "No review found for this user" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
