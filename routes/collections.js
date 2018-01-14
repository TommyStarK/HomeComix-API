const database = require('../database.js')

const collections = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const docs = await db.collection('collections').find({
        userId: request.decoded.userId
      }, {
        name: 1,
        books: 1
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

  async create (request, response, next) {
    let books = []
    const db = database.get()

    if (typeof request.body.name === 'undefined') {
      return response.status(422).json({
        status: 422,
        success: false,
        message: 'Unprocessable entity'
      })
    }

    try {
      const doc = await db.collection('collections').findOne(
        {
          $and: [
            {userId: request.decoded.userId},
            {name: request.body.name}
          ]
        })

      if (doc) {
        return response.status(409).json({
          status: 409,
          success: false,
          message: `Conflict: ${request.body.name} already exists`
        })
      }

      await db.collection('collections').insertOne({
        name: request.body.name,
        userId: request.decoded.userId,
        books: books
      })

      return response.status(201).json({
        status: 201,
        success: true,
        message: 'Collection created successfully'
      })
    } catch (err) {
      next(err)
    }
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
