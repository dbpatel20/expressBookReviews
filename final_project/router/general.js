const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
module.exports.users = users; 
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
  const { username, password } = req.body; 

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; 
  const book = books[isbn]; 

  if (book) {
      return res.status(300).json(book);
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author; 
  const matchingBooks = Object.values(books).filter(book => book.author === author);

  if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
  } else {
      return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = Object.values(books).filter(book => book.title === title);

  if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
  } else {
      return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; 
    const book = books[isbn]; 

    if (book && book.reviews) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});


public_users.get('/books', (req, res) => {
  axios.get('http://localhost:5000/')
      .then(response => {
          res.status(200).json(response.data);
      })
      .catch(error => {
          res.status(500).json({ message: "Error fetching books", error: error.message });
      });
});

public_users.get('/books/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn; 
  try {
      if (books[isbn]) {
          return res.status(200).json(books[isbn]); 
      } else {
          throw new Error("Book not found");
      }
  } catch (error) {
      return res.status(404).json({ message: "Book not found", error: error.message });
  }
});


public_users.get('/books/author/:author', (req, res) => {
  const author = req.params.author;
  axios.get(`http://localhost:5000/author/${author}`)
      .then(response => {
          res.status(200).json(response.data);
      })
      .catch(error => {
          res.status(404).json({ message: "Books by this author not found", error: error.message });
      });
});

public_users.get('/books/title/:title', (req, res) => {
  const title = req.params.title;
  axios.get(`http://localhost:5000/title/${title}`)
      .then(response => {
          res.status(200).json(response.data);
      })
      .catch(error => {
          res.status(404).json({ message: "Books with this title not found", error: error.message });
      });
});


module.exports.general = public_users;
