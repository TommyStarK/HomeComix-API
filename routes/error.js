var error = {

	// Handling error ressource not found
	notFound: function(request, response, next) {

		response.status(404).json({
			what: "Not Found"
		});

  		next();
	}
};

module.exports = error;
