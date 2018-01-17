const database = require('../database.js')

const authors = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const authors = await db.collection('authors').find({
        userId: request.decoded.userId
      }, {
        name: 1,
        books: 1
      }).toArray()

      if (!authors.length) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'No author found'
        })
      }

      return response.status(200).json({
        status: 200,
        success: true,
        authors: authors
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
    const db = database.get()

    if (typeof request.body.name === 'undefined') {
      return response.status(412).json({
        status: 412,
        success: false,
        message: 'Body missing name field'
      })
    }

    try {
      const doc = await db.collection('authors').findOne(
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

      await db.collection('authors').insertOne({
        name: request.body.name,
        userId: request.decoded.userId,
        books: []
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

  async update (request, response, next) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    try {
      if (request.body.id === undefined) {
        return response.status(412).json({
          status: 412,
          success: false,
          message: 'Body missing id field'
        })
      }

      const author = await db.collection('authors').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          name: 1
        })

      if (!author) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Author not found'
        })
      }

      await db.collection('authors').update(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          $push: {
            books: {id: request.body.id}
          }
        })

      await db.collection('books').update(
        {
          _id: ObjectId(request.body.id),
          userId: request.decoded.userId
        },
        {
          $set:{
            author: author.name
          }
        })

      return response.status(200).json({
        status: 200,
        success: true,
        message: 'Author updated successfully'
      })
    } catch (err) {
      next(err)
    }
  },

  async delete (request, response, next) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    try {
      const target = await db.collection('authors').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          name: 1
        })

      if (!target) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Author not found'
        })
      }

      const doc = await db.collection('authors').findOneAndDelete(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        })

      if (doc && doc.value !== null) {
        await db.collection('books').update(
          {
            author: target.name,
            userId: request.decoded.userId
          },
          {
            $set: {
              author: ''
            }
          },
          {
            multi: true
          })

        return response.status(200).json({
          status: 200,
          success: true,
          message: 'Author deleted successfully'
        })
      }

      return response.status(500).json({
        status: 500,
        success: false,
        message: 'An unexpected error occured during the deletion of the author'
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = authors
