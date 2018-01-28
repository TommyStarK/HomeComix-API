const utils = require('../utils.js')
const database = require('../database.js')

const authors = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const authors = await db.collection('authors').find({
        userId: request.decoded.userId
      }, {
        name: 1,
        description: 1,
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
          description: 1,
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
        message: 'A name is mandatory to create a new author'
      })
    }

    try {
      const author = await db.collection('authors').findOne(
        {
          name: body.name,
          userId: request.decoded.userId
        })

      if (author) {
        return response.status(409).json({
          status: 409,
          success: false,
          message: `Conflict: Author '${body.name}' already exists`
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

      const newAuthor = await db.collection('authors').insertOne({
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
              authors: {
                id: newAuthor.insertedId,
                name: body.name
              }
            }
          })
      }

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
      const author = await db.collection('authors').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          name: 1,
          description: 1
        })

      if (!author) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Author not found'
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

      await db.collection('authors').updateOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          $set: {
            name: body.name == '' ? author.name : body.name,
            description: body.description == '' ? author.description : body.description
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
              authors: {
                id: author._id,
                name: body.name == '' ? author.name : body.name
              }
            }
          })
      }

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
            'authors.id': {
              $eq: ObjectId(request.params.id)
            },
            userId: request.decoded.userId
          },
          {
            $pull: {
              authors: {
                id: ObjectId(request.params.id)
              }
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
