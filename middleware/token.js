module.exports = (request, response, next) => {
	const token = (request.body && request.body.access_token) || (request.query && request.query.access_token) || request.headers['x-access-token'] || request.headers.authorization;

	if (token) {
		try {
			// Decode token
			console.log(`route: [${request.url}] | token: ${token}`);
			next();
		} catch (err) {
			return response.status(500).json({
				status: 500,
				success: false,
				message: 'Internal server error',
				err
			});
		}
	} else {
		return response.status(401).json({
			status: 401,
			success: false,
			message: 'No token provided'
		});
	}
};
