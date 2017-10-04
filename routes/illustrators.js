
const illustrators = {

	getAll(request, response) {
		return response.status(200).json({
			status: 200,
			message: 'GET all illustrators'
		});
	},

	getOne(request, response) {
		return response.status(200).json({
			status: 200,
			message: `GET one illustrator with id: ${request.params.id}`
		});
	},

	create(request, response) {
		return response.status(201).json({
			status: 201,
			success: true,
			message: 'CREATE illustrator',
			body: request.body
		});
	},

	update(request, response) {
		return response.status(200).json({
			status: 200,
			success: true,
			message: `UPDATE illustrator with id: ${request.params.id}`,
			body: request.body
		});
	},

	delete(request, response) {
		return response.status(200).json({
			status: 200,
			success: true,
			message: `DELETE illustrator with id: ${request.params.id}`
		});
	}
};

module.exports = illustrators;
