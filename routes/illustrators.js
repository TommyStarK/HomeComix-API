const database = require('../database.js')

const illustrators = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const docs = await db.collection('illustrators').find({
        userId: request.decoded.userId
      }, {
        name: 1,
        books: 1
      }).toArray()

      if (!docs.length) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'No illustrator found'
        })
      }

      return response.status(200).json({
        status: 200,
        success: true,
        illustrators: docs
      })
    } catch (err) {
      next(err)
    }
  },

  async getOne (request, response, next) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    try {
      const illustrator = await db.collection('illustrators').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        }, {
          name: 1,
          books: 1
        })

      if (!illustrator) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Illustrator not found'
        })
      }

      return response.status(200).json({
        status: 200,
        success: true,
        illustrator: illustrator
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
      const doc = await db.collection('illustrators').findOne(
        {
          name: request.body.name,
          userId: request.decoded.userId
        })

      if (doc) {
        return response.status(409).json({
          status: 409,
          success: false,
          message: `Conflict: ${request.body.name} already exists`
        })
      }

      await db.collection('illustrators').insertOne({
        name: request.body.name,
        userId: request.decoded.userId,
        books: books
      })

      return response.status(201).json({
        status: 201,
        success: true,
        message: 'Illustrator created successfully'
      })
    } catch (err) {
      next(err)
    }
  },

  async update (request, response, next) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    try {
      const illustrator = await db.collection('illustrators').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        })

      if (!illustrator) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Illustrator not found'
        })
      }

      await db.collection('illustrators').update(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          $push: {
            books: {id: request.body.name}
          }
        })

      return response.status(200).json({
        status: 200,
        success: true,
        message: 'Illustrator updated successfully'
      })
    } catch (err) {
      next(err)
    }
  },

  delete (request, response, next) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Illustrator deleted successfully'
    })
  }
}

module.exports = illustrators
