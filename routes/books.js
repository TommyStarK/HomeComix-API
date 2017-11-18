const database = require('../database.js');

const books = {

	getAll(request, response) {
		const db = database.get();

		try {
			db.collection('books').find({}).toArray((err, docs) => {
				if (err) {
					throw (err);
				}

				return response.status(200).json({
					status: 200,
					success: true,
					message: 'GET all books',
					books: docs
				});
			});
		} catch (err) {
			console.log(err);
			database.close();
			return response.status(500).json({
				status: 500,
				success: false,
				message: 'Internal server error'
			});
		}
	},

	getOne(request, response) {
		console.log(request.params);
		return response.status(200).json({
			status: 200,
			success: true,
			message: `GET one book with id: ${request.params.id}`
		});
	},

	create(request, response) {
		const db = database.get();

		try {
			db.collection('books').insertOne(request.body, (err, result) => {
				if (err) {
					throw (err);
				}

				console.log(result);
				return response.status(201).json({
					status: 201,
					success: true,
					message: 'CREATE book',
					body: request.body
				});
			});
		} catch (err) {
			console.log(err);
			database.close();
			return response.status(500).json({
				status: 500,
				success: false,
				message: 'Internal server error'
			});
		}
	},

	update(request, response) {
		return response.status(200).json({
			status: 200,
			success: true,
			message: `UPDATE book with id: ${request.params.id}`,
			body: request.body
		});
	},

	delete(request, response) {
		return response.status(200).json({
			status: 200,
			success: true,
			message: `DELETE book with id: ${request.params.id}`
		});
	}
};

module.exports = books;
