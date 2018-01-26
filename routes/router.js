const express = require('express')
const multer = require('multer')
const upload = multer({ dest: '.uploads/' })
const router = new express.Router()

// Routes handlers
const books = require('./books.js')
const authors = require('./authors.js')
const collections = require('./collections.js')
const illustrators = require('./illustrators.js')

//
// Routing
//

// Frist path handled
router.get('/api.homecomix', (request, response, next) => {
  response.status(200).json({
    status: 200,
    success: true,
    message: 'Welcome to the HomeComix-API'
  })
})

router.get('/api.homecomix/authors', authors.getAll)
router.get('/api.homecomix/author/:id', authors.getOne)
router.post('/api.homecomix/author', authors.create)
router.put('/api.homecomix/author/:id', authors.update)
router.delete('/api.homecomix/author/:id', authors.delete)

router.get('/api.homecomix/books', books.getAll)
router.get('/api.homecomix/book/:id', books.getOne)
router.get('/api.homecomix/book/:id/page/:pid', books.getPage)
router.get('/api.homecomix/book/:id/thumbnail', books.thumbnail)
router.post('/api.homecomix/book', upload.single('file'), books.create)
router.put('/api.homecomix/book/:id', books.update)
router.delete('/api.homecomix/book/:id', books.delete)

router.get('/api.homecomix/collections', collections.getAll)
router.get('/api.homecomix/collection/:id', collections.getOne)
router.post('/api.homecomix/collection', collections.create)
router.put('/api.homecomix/collection/:id', collections.update)
router.delete('/api.homecomix/collection/:id', collections.delete)

router.get('/api.homecomix/illustrators', illustrators.getAll)
router.get('/api.homecomix/illustrator/:id', illustrators.getOne)
router.post('/api.homecomix/illustrator', illustrators.create)
router.put('/api.homecomix/illustrator/:id', illustrators.update)
router.delete('/api.homecomix/illustrator/:id', illustrators.delete)

// Error middleware to catch unexpected errors
router.use(require('../middleware/error.js').errorHandler)

// If no route is matched a '404 Not Found' error is returned.
router.all('*', require('../middleware/error.js').notFound)

module.exports = router
