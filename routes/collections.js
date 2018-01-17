const database = require('../database.js')

const collections = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const collections = await db.collection('collections').find({
        userId: request.decoded.userId
      }, {
        name: 1,
        books: 1
      }).toArray()

      if (!collections.length) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'No collection found'
        })
      }

      return response.status(200).json({
        status: 200,
        success: true,
        collections: collections
      })
    } catch (err) {
      next(err)
    }
  },

  async getOne (request, response, next) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    try {
      const collection = await db.collection('collections').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        }, {
          name: 1,
          books: 1
        })

      if (!collection) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Collection not found'
        })
      }

      return response.status(200).json({
        status: 200,
        success: true,
        collection: collection
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
      const doc = await db.collection('collections').findOne(
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

      await db.collection('collections').insertOne({
        name: request.body.name,
        userId: request.decoded.userId,
        books: []
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

      const collection = await db.collection('collections').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          name: 1
        })

      if (!collection) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Collection not found'
        })
      }

      await db.collection('collections').update(
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
            collection: collection.name
          }
        })

      return response.status(200).json({
        status: 200,
        success: true,
        message: 'Collection updated successfully'
      })
    } catch (err) {
      next(err)
    }
  },

  async delete (request, response, next) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    try {
      const target = await db.collection('collections').findOne(
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
            message: 'Collection not found'
          })
        }

      const doc = await db.collection('collections').findOneAndDelete(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        })

      if (doc && doc.value !== null) {
        await db.collection('books').update(
          {
            collection: target.name,
            userId: request.decoded.userId
          },
          {
            $set: {
              collection: ''
            }
          },
          {
            multi: true
          })

        return response.status(200).json({
          status: 200,
          success: true,
          message: 'Collection deleted successfully'
        })
      }

      return response.status(500).json({
        status: 500,
        success: false,
        message: 'An unexpected error occured during the deletion of the collection'
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = collections
