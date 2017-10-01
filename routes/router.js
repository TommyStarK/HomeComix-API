const express = require('express');
const router = express.Router();

// Routes handlers
const authors = require('./authors.js');
const books = require('./books.js');
const illustrators = require('./illustrators.js');
const collections = require('./collections.js');

// Routing
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
		message: "Test middleware :)"
	});
});

// If no route is matched a '404 Not Found' error is returned.
router.use(require('./error.js').notFound);

module.exports = router;
