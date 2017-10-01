module.exports = function(request, response, next) {
	console.log(request);
	return response.status(200).json({
		status: 200,
		message: "Request logged"
	});
};
