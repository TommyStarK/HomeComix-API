const database = require('../database.js')

const collections = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const docs = await db.collection('collections').find({
        userId: request.decoded.userId
      }).toArray()

      if (!docs.length) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'No collection found'
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
    let collection
    return response.status(200).json({
      status: 200,
      success: true,
      collection: collection
    })
  },

  create (request, response, next) {
    return response.status(201).json({
      status: 201,
      success: true,
      message: 'Collection created successfully'
    })
  },

  update (request, response, next) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Collection updated successfully'
    })
  },

  delete (request, response, next) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Collection deleted successfully'
    })
  }
}

module.exports = collections
