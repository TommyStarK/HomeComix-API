const utils = require('../utils.js')
const database = require('../database.js')

const illustrators = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const illustrators = await db.collection('illustrators').find({
        userId: request.decoded.userId
      }, {
        name: 1,
        description: 1,
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
          description: 1,
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
    const ObjectId = require('mongodb').ObjectId

    let body = utils.bodyHandler(request)

    if (body['notSupported'] !== undefined) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: `Body: field '${body['notSupported']}' not supported`
      })
    } else if (body['notValid'] !== undefined) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: `Body: Array not supported for '${body['notValid']}'`
      })
    }

    if (!body.name.length) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: 'A name is mandatory to create a new illustrator'
      })
    }

    try {
      const illustrator = await db.collection('illustrators').findOne(
        {
          name: body.name,
          userId: request.decoded.userId
        })

      if (illustrator) {
        return response.status(409).json({
          status: 409,
          success: false,
          message: `Conflict: Illustrator '${body.name}' already exists`
        })
      }

      body = await utils.retrieveBookID(body, request.decoded.userId)

      if (body['notFound'] !== undefined) {
        return response.status(409).json({
          status: 409,
          success: false,
          message: `No book named '${body['notFound']}' found`
        })
      }

      const newIllustrator = await db.collection('illustrators').insertOne({
        name: body.name,
        description: body.description,
        userId: request.decoded.userId,
        books: body.books
      })

      for (let item in body.books) {
        await db.collection('books').updateOne(
          {
            _id: ObjectId(body.books[item].id),
            userId: request.decoded.userId
          },
          {
            $addToSet: {
              illustrators: {
                id: newIllustrator.insertedId,
                name: body.name
              }
            }
          })
      }

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

    let body = utils.bodyHandler(request)

    if (body['notSupported'] !== undefined) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: `Body: field '${body['notSupported']}' not supported`
      })
    } else if (body['notValid'] !== undefined) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: `Body: Array not supported for '${body['notValid']}'`
      })
    }

    try {
      const illustrator = await db.collection('illustrators').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          name: 1,
          description: 1
        })

      if (!illustrator) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Illustrator not found'
        })
      }

      body = await utils.retrieveBookID(body, request.decoded.userId)

      if (body['notFound'] !== undefined) {
        return response.status(409).json({
          status: 409,
          success: false,
          message: `No book named '${body['notFound']}' found`
        })
      }

      for (let item in body.books) {
        delete body.books[item].title
        body.books[item].id = ObjectId(body.books[item].id)
      }

      await db.collection('illustrators').updateOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          $set: {
            name: body.name == '' ? illustrator.name : body.name,
            description: body.description == '' ? illustrator.description : body.description
          },
          $addToSet: {
            books: {
              $each: body.books
            }
          }
        })

      for (let item in body.books) {
        await db.collection('books').updateOne(
          {
            _id: body.books[item].id,
            userId: request.decoded.userId
          },
          {
            $addToSet: {
              illustrators: {
                id: illustrator._id,
                name: body.name == '' ? illustrator.name : body.name
              }
            }
          })
      }

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
            illustrators: {
                $in: [
                    {
                        id: ObjectId(request.params.id),
                        name: target.name
                    }
                ]
            },
            userId: request.decoded.userId
          },
          {
            $pull: {
              illustrators: {
                   id: ObjectId(request.params.id),
                   name: target.name
               }
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
