const jwt = require('jsonwebtoken');

module.exports = (request, response, next) => {
	const token = (request.body && request.body.access_token) || (request.query && request.query.access_token) || request.headers['x-access-token'] || request.headers.authorization;

	if (token) {
		try {
			jwt.verify(token, '1S3cR€T!', (err, decoded) => {
				if (err) {
					return response.status(401).json({
						status: 401,
						success: false,
						message: 'Failed to authenticate the token'
					});
				}
				request.decoded = decoded;
				next();
			});
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
