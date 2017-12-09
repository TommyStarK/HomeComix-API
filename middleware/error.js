const error = {
  // Handler for the HTTP 404 Not Found error
  notFound (request, response, next) {
    response.status(404).json({
      status: 404,
      success: false,
      message: '404 not found'
    })

    next()
  },

  // Middleware to catch unexpected errors
  errorHandler (err, request, response, next) {
    return response.status(500).json({
      status: 500,
      success: false,
      message: 'Internal server error',
      error: err.message
    })
  }
}

module.exports = error
