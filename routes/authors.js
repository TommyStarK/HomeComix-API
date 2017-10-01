
var authors = {

	getAll: function(request, response) {
		return response.status(200).json({
			status: 200,
			message: "GET all authors"
		});
	},

	getOne: function(request, response) {
		return response.status(200).json({
			status: 200,
			message: "GET one author with id: " + request.params.id
		});
	},

	create: function(request, response) {
		return response.status(201).json({
			status: 201,
			success: true,
			message: "CREATE author",
			body: request.body
		});
	},

	update: function(request, response) {
		return response.status(200).json({
			status: 200,
			success: true,
			message: "UPDATE author with id: " + request.params.id,
			body: request.body
		});
	},

	delete: function(request, response) {
		return response.status(200).json({
			status: 200,
			success: true,
			message: "DELETE author with id: " + request.params.id
		});

	}
};


module.exports = authors;
