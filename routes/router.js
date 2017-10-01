const express = require('express');
const router = express.Router();

// Routes handlers
const authors = require('./authors.js');
const books = require('./books.js');
const collections = require('./collections.js');
const illustrators = require('./illustrators.js');

//
// Routing
//

// Frist path handled
router.get('/homecomix', function(request, response) {
	response.status(200).json({
		status: 200,
		message: "Welcome to the HomeComix-API"
	});
});

// Testing purpose only
router.get('/homecomix/testmiddlewares/token', function(request, response) {
	return response.status(200).json({
		status: 200,
		success: true,
		message: "Test middleware :)"
	});
});

router.get('/homecomix/authors', authors.getAll);
router.get('/homecomix/author/:id', authors.getOne);
router.post('/homecomix/author', authors.create);
router.put('/homecomix/author/:id', authors.update);
router.delete('/homecomix/author/:id', authors.delete);

router.get('/homecomix/books', books.getAll);
router.get('/homecomix/book/:id', books.getOne);
router.post('/homecomix/book', books.create);
router.put('/homecomix/book/:id', books.update);
router.delete('/homecomix/book/:id', books.delete);

router.get('/homecomix/collections', collections.getAll);
router.get('/homecomix/collection/:id', collections.getOne);
router.post('/homecomix/collection', collections.create);
router.put('/homecomix/collection/:id', collections.update);
router.delete('/homecomix/collection/:id', collections.delete);

router.get('/homecomix/illustrators', illustrators.getAll);
router.get('/homecomix/illustrator/:id', illustrators.getOne);
router.post('/homecomix/illustrator', illustrators.create);
router.put('/homecomix/illustrator/:id', illustrators.update);
router.delete('/homecomix/illustrator/:id', illustrators.delete);

// If no route is matched a '404 Not Found' error is returned.
router.use(require('./error.js').notFound);

module.exports = router;
