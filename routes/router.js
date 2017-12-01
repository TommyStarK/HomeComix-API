const express = require('express')
const multer = require('multer')
const upload = multer({ dest: '.uploads/' })
const router = new express.Router()

// Routes handlers
const authors = require('./authors.js')
const books = require('./books.js')
const collections = require('./collections.js')
const illustrators = require('./illustrators.js')

//
// Routing
//

// Frist path handled
router.get('/api.homecomix', (request, response) => {
  response.status(200).json(
      {status: 200, success: true, message: 'Welcome to the HomeComix-API'})
})

router.get('/api.homecomix/:uid/authors', authors.getAll)
router.get('/api.homecomix/:uid/author/:id', authors.getOne)
router.post('/api.homecomix/:uid/author', authors.create)
router.put('/api.homecomix/:uid/author/:id', authors.update)
router.delete('/api.homecomix/:uid/author/:id', authors.delete)

router.get('/api.homecomix/:uid/books', books.getAll)
router.get('/api.homecomix/:uid/book/:id', books.getOne)
router.get('/api.homecomix/:uid/book/:id/page/:pid', books.getPage)
router.post('/api.homecomix/:uid/book', upload.single('file'), books.create)
router.put('/api.homecomix/:uid/book/:id', books.update)
router.delete('/api.homecomix/:uid/book/:id', books.delete)

router.get('/api.homecomix/:uid/collections', collections.getAll)
router.get('/api.homecomix/:uid/collection/:id', collections.getOne)
router.post('/api.homecomix/:uid/collection', collections.create)
router.put('/api.homecomix/:uid/collection/:id', collections.update)
router.delete('/api.homecomix/:uid/collection/:id', collections.delete)

router.get('/api.homecomix/:uid/illustrators', illustrators.getAll)
router.get('/api.homecomix/:uid/illustrator/:id', illustrators.getOne)
router.post('/api.homecomix/:uid/illustrator', illustrators.create)
router.put('/api.homecomix/:uid/illustrator/:id', illustrators.update)
router.delete('/api.homecomix/:uid/illustrator/:id', illustrators.delete)

// If no route is matched a '404 Not Found' error is returned.
router.all('*', require('./error.js').notFound)

// Error middleware
router.use((err, request, response, next) => {
  if (err) {
    console.log(err)
    return response.status(500).json(
      { status: 500, success: true, message: 'Internal server error' })
  }
  next()
})

module.exports = router
