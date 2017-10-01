
var books = {

	getAll: function(request, response) {
		return response.status(200).json({
			status: 200,
			message: "GET all books"
		});
	},

	getOne: function(request, response) {
		return response.status(200).json({
			status: 200,
			message: "GET one book with id: " + request.params.id
		});
	},

	create: function(request, response) {
		return response.status(201).json({
			status: 201,
			success: true,
			message: "CREATE book",
			body: request.body
		});
	},

	update: function(request, response) {
		return response.status(200).json({
			status: 200,
			success: true,
			message: "UPDATE book with id: " + request.params.id,
			body: request.body
		});
	},

	delete: function(request, response) {
		return response.status(200).json({
			status: 200,
			success: true,
			message: "DELETE book with id: " + request.params.id
		});

	}
};


module.exports = books;
