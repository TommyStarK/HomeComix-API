
var collections = {

	getAll: function(request, response) {
		return response.status(200).json({
			status: 200,
			message: "GET all collections"
		});
	},

	getOne: function(request, response) {
		return response.status(200).json({
			status: 200,
			message: "GET one collection with id: " + request.params.id
		});
	},

	create: function(request, response) {
		return response.status(201).json({
			status: 201,
			success: true,
			message: "CREATE collection",
			body: request.body
		});
	},

	update: function(request, response) {
		return response.status(200).json({
			status: 200,
			success: true,
			message: "UPDATE collection with id: " + request.params.id,
			body: request.body
		});
	},

	delete: function(request, response) {
		return response.status(200).json({
			status: 200,
			success: true,
			message: "DELETE collection with id: " + request.params.id
		});

	}
};

module.exports = collections;
