const database = require('../database.js')

const authors = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const docs = await db.collection('authors').find({
        userId: request.decoded.userId
      }).toArray()

      if (!docs.length) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'No author found'
        })
      }

      return response.status(200).json({
        status: 200,
        success: true,
        books: docs
      })
    } catch (err) {
      next(err)
    }
  },

  getOne (request, response, next) {
    let author
    return response.status(200).json({
      status: 200,
      success: true,
      author: author
    })
  },

  create (request, response, next) {
    return response.status(201).json({
      status: 201,
      success: true,
      message: 'Author created successfully'
    })
  },

  update (request, response, next) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Author updated successfully'
    })
  },

  delete (request, response, next) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Author deleted successfully'
    })
  }
}

module.exports = authors
