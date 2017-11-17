const database = require('../database.js');

const books = {

	getAll(request, response) {
		const db = database.get();

		const cursor = db.collection('books').find({});

		cursor.forEach(item => {
			console.log(item);
		}, err => {
			console.log(err);
			database.close();
		});

		return response.status(200).json({
			status: 200,
			message: 'GET all books'
		});
	},

	getOne(request, response) {
		return response.status(200).json({
			status: 200,
			message: `GET one book with id: ${request.params.id}`
		});
	},

	create(request, response) {
		const db = database.get();

		db.collection('books').insertOne(request.body, err => {
			if (err) {
				throw (err);
			}
		});

		return response.status(201).json({
			status: 201,
			success: true,
			message: 'CREATE book',
			body: request.body
		});
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
