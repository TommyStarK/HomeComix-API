const database = require('../database.js')

const illustrators = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const illustrators = await db.collection('illustrators').find({
        userId: request.decoded.userId
      }, {
        name: 1,
        books: 1
      }).toArray()

      if (!illustrators.length) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'No illustrator found'
        })
      }

      return response.status(200).json({
        status: 200,
        success: true,
        illustrators: illustrators
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
    const db = database.get()

    if (typeof request.body.name === 'undefined') {
      return response.status(412).json({
        status: 412,
        success: false,
        message: 'Body missing name field'
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
        books: []
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

    console.log('DEBUG')

    try {
      if (request.body.id === undefined) {
        return response.status(412).json({
          status: 412,
          success: false,
          message: 'Body missing id field'
        })
      }

      const illustrator = await db.collection('illustrators').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          name: 1
        })

      if (!illustrator) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Illustrator not found'
        })
      }

      await db.collection('illustrator').update(
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
            illustrator: illustrator.name
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

  async delete (request, response, next) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    try {
      const target = await db.collection('illustrators').findOne(
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
          message: 'Illustrator not found'
        })
      }

      const doc = await db.collection('illustrators').findOneAndDelete(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        })

      if (doc && doc.value !== null) {
        await db.collection('books').update(
          {
            illustrator: target.name,
            userId: request.decoded.userId
          },
          {
            $set: {
              illustrator: ''
            }
          },
          {
            multi: true
          })

        return response.status(200).json({
          status: 200,
          success: true,
          message: 'Illustrator deleted successfully'
        })
      }

      return response.status(500).json({
        status: 500,
        success: false,
        message: 'An unexpected error occured during the deletion of the illustrator'
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = illustrators
