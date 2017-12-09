const database = require('../database.js')

const authors = {

  async getAll (request, response) {
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
      console.log(err)
      database.close()
      return response.status(500).json({
        status: 500,
        success: false,
        message: 'Internal server error'
      })
    }
  },

  getOne (request, response) {
    let author
    return response.status(200).json({
      status: 200,
      success: true,
      author: author
    })
  },

  create (request, response) {
    return response.status(201).json({
      status: 201,
      success: true,
      message: 'Author created successfully'
    })
  },

  update (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Author updated successfully'
    })
  },

  delete (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Author deleted successfully'
    })
  }
}

module.exports = authors
