const fs = require('fs')
const path = require('path')
const extension = path.extname
const utils = require('../utils.js')
const mkdirp = require('async-mkdirp')
const database = require('../database.js')

const books = {

  async getAll (request, response) {
    const db = database.get()

    try {
      const books = await db.collection('books').find({
        userId: request.params.uid
      }).toArray()

      if (!books) {
        return response.status(204).json({
          status: 204,
          success: false,
          message: 'Ressource not found'
        })
      }

      books.forEach(item => {
        delete item.hashname
        delete item.userId
        delete item.encoding
        delete item.mimetype
        delete item.content
      })

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

  async getOne (request, response) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    try {
      const book = await db.collection('books').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.params.uid
        })

      if (!book) {
        return response.status(204).json({
          status: 204,
          success: false,
          message: 'Ressource not found'
        })
      }

      delete book.hashname
      delete book.userId
      delete book.encoding
      delete book.mimetype
      delete book.content

      return response.status(200).json({
        status: 200,
        success: true,
        message: `GET page of book with id: ${request.params.id}`,
        book: book
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

  async getPage (request, response) {
    const db = database.get()
    const bucket = database.bucket()
    const ObjectId = require('mongodb').ObjectId
    const dir = path.join('.uploads', 'tmp')

    try {
      const book = await db.collection('books').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.params.uid
        })

      if (!book || (parseInt(request.params.pid) > (book.pagesNumber - 1))) {
        return response.status(204).json({
          status: 204,
          success: false,
          message: 'Ressource not found'
        })
      }

      await mkdirp(dir)
      const file = book.content[request.params.pid]
      await bucket.find({ _id: ObjectId(file.fileId) })
      await utils.writeFileAsync(path.join(dir, file.name), '')
      await bucket.openDownloadStreamByName(file.name)
        .pipe(fs.createWriteStream(path.join(dir, file.name)))
        .on('finish', function () {
          utils.readdirAsync(dir)
            .then((items) => utils.encodeBase64(path.join(dir, items[0])))
            .then((p) => {
                response.status(200).json({
                  status: 200,
                  success: true,
                  message: `GET book: ${request.params.id} page: ${request.params.pid}`,
                  page: p
                })
              })
            .then(() => utils.removeContentDirectory('.uploads/'))
            .catch((err) => console.log(err))
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

  async create (request, response) {
    let index = 0
    let pages = []
    const db = database.get()
    const bucket = database.bucket()

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

      await handler(request.file.path, '.uploads/tmp')
      const items = await utils.readdirAsync('.uploads/tmp')
      for (let item of items) {
        const data = await fs.createReadStream(path.join('.uploads/tmp', item))
          .pipe(bucket.openUploadStream(item))
        pages.push({
          id: index++,
          name: data.filename,
          fileId: data.id
        })
      }

      await db.collection('books').insertOne({
        name: request.file.originalname,
        hashname: request.file.filename,
        userId: request.params.uid,
        encoding: request.file.encoding,
        mimetype: request.file.mimetype,
        size: request.file.size,
        pagesNumber: index,
        content: pages
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
