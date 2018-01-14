const database = require('../database.js')

const authors = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const docs = await db.collection('authors').find({
        userId: request.decoded.userId
      }, {
        name: 1,
        books: 1
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
        authors: docs
      })
    } catch (err) {
      next(err)
    }
  },

  async getOne (request, response, next) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    try {
      const author = await db.collection('authors').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        }, {
          name: 1,
          books: 1
        })

      if (!author) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Author not found'
        })
      }

      return response.status(200).json({
        status: 200,
        success: true,
        author: author
      })
    } catch (err) {
      next(err)
    }
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
      const doc = await db.collection('authors').findOne(
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

      await db.collection('authors').insertOne({
        name: request.body.name,
        userId: request.decoded.userId,
        books: books
      })

      return response.status(201).json({
        status: 201,
        success: true,
        message: 'Author created successfully'
      })
    } catch (err) {
      next(err)
    }
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
