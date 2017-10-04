const error = {
	// Handler for the HTTP 404 Not Found error
	notFound(request, response, next) {
		response.status(404).json({
			status: 404,
			message: 'Not Found'
		});

		next();
	}
};

module.exports = error;
