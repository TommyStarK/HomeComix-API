const utils = require('../utils.js');
const database = require('../database.js');

const account = {

	register(request, response) {
		const db = database.get();

		if (request.body.username === undefined ||
				request.body.password === undefined ||
				request.body.email === undefined) {
			return response.status(400).json({
				status: 400,
				success: false,
				message: 'An username, a valid email and a password must be provided to register a new account'
			});
		}

		try {
			db.collection('users').findOne(
				{
					email: utils.hash(request.body.email)
				}, (err, doc) => {
				if (err) {
					throw (err);
				}

				if (doc) {
					return response.status(400).json({
						status: 400,
						success: false,
						message: 'Account already exists'
					});
				}

				db.collection('users').insertOne({
					username: request.body.username,
					password: utils.hash(request.body.password),
					email: utils.hash(request.body.email)
				}, err => {
					if (err) {
						throw (err);
					}

					return response.status(201).json({
						status: 201,
						success: true,
						message: 'Registration succeed'
					});
				});
			});
		} catch (err) {
			console.log(err);
			return response.status(500).json({
				status: 500,
				success: false,
				message: 'Internal server error'
			});
		}
	},

	authorize(request, response) {
		console.log(request.body);
		return response.status(200).json({
			status: 200,
			success: true,
			message: 'test login'
		});
	},

	delete(request, response) {
		console.log(request.body);
		return response.status(200).json({
			status: 200,
			success: true,
			message: 'test delete'
		});
	}

};

module.exports = account;
