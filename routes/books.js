const utils = require('../utils.js')
const database = require('../database.js')
const extension = require('path').extname

const books = {

  async getAll (request, response) {
    const db = database.get()

    try {
      const books = await db.collection('books').find({
        userId: request.params.uid
      }).toArray()

      return response.status(200).json({
        status: 200,
        success: true,
        message: 'GET all books',
        books: books
      })
    } catch (err) {
      console.log(err)
      database.close()
      return response.status(500).json({
        status: 500,
        success: false,
        message: 'Internal server error'
      })
    }
  },

  getOne (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: `GET one book with id: ${request.params.id}`
    })
  },

  getPage (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: `GET page of book with id: ${request.params.id} page number: ${request.params.pid}`
    })
  },

  async create (request, response) {
    const db = database.get()
    let toto = [{ id: '1', data: 'azeazeaze13123DSQD', name: 'test' }, { id: '2', data: '234GFSD231423', name: 'test2' }]

    if (typeof request.file === 'undefined') {
      return response.status(422).json({
        status: 422,
        success: false,
        message: 'Unprocessable entity'
      })
    }

    try {
      const handler = utils.archiveHandler(extension(request.file.originalname))

      if (handler instanceof Error) {
        throw (handler)
      }

      const doc = await db.collection('books').findOne(
        {
          $and: [
            {userId: request.params.uid},
            {name: request.file.originalname}
          ]
        })

      if (doc) {
        return response.status(409).json({
          status: 409,
          success: false,
          message: `Conflict: ${request.file.originalname} already exists`
        })
      }

      await handler(request.file.path, '.uploads/')

      await db.collection('books').insertOne({
        name: request.file.originalname,
        hashname: request.file.filename,
        userId: request.params.uid,
        encoding: request.file.encoding,
        mimetype: request.file.mimetype,
        size: request.file.size,
        pagesNumber: 68,
        content: toto
      })

      return response.status(201).json({
        status: 201,
        success: true,
        message: 'CREATE book success'
      })
    } catch (err) {
      console.log(err)
      database.close()
      return response.status(500).json({
        status: 500,
        success: false,
        message: 'Internal server error'
      })
    } finally {
      await utils.removeContentDirectory('.uploads/')
    }
  },

  update (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: `UPDATE book with id: ${request.params.id}`,
      body: request.body
    })
  },

  delete (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: `DELETE book with id: ${request.params.id}`
    })
  }
}

module.exports = books
