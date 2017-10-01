const jwt = require('jwt-simple');

module.exports = function(request, response, next) {

	var token = (request.body && request.body.access_token) || (request.query && request.query.access_token) || request.headers['x-access-token'] || request.headers['authorization'];

	if (token) {

		try {

			// decode token
			next();

		} catch(error) {
			return response.status(500).json({
				status: 500,
				message: "Internal server error",
				error: error
			});
		}

	} else {
		return response.status(401).json({
			status: 401,
			message: "No token provided"
		});
	}
};
