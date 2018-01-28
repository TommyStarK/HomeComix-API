const utils = require('../utils.js')
const database = require('../database.js')

const collections = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const collections = await db.collection('collections').find({
        userId: request.decoded.userId
      }, {
        name: 1,
        description: 1,
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
          description: 1,
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
        message: 'A name is mandatory to create a new collection'
      })
    }

    try {
      const collection = await db.collection('collections').findOne(
        {
          name: body.name,
          userId: request.decoded.userId
        })

      if (collection) {
        return response.status(409).json({
          status: 409,
          success: false,
          message: `Conflict: Collection '${body.name}' already exists`
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

      const newCollection = await db.collection('collections').insertOne({
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
              collections: {
                id: newCollection.insertedId,
                name: body.name
              }
            }
          })
      }

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
      const collection = await db.collection('collections').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          name: 1,
          description: 1
        })

      if (!collection) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Collection not found'
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

      await db.collection('collections').updateOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          $set: {
            name: body.name == '' ? collection.name : body.name,
            description: body.description == '' ? collection.description : body.description
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
              collections: {
                id: collection._id,
                name: body.name == '' ? collection.name : body.name
              }
            }
          })
      }

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
            collections: {
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
              collections: {
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
