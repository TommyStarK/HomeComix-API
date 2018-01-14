const fs = require('fs')
const path = require('path')
const extension = path.extname
const utils = require('../utils.js')
const mkdirp = require('async-mkdirp')
const database = require('../database.js')
const dir = path.join('.', '.uploads')
const tmp = path.join('.', '.uploads', 'tmp')

const books = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const books = await db.collection('books').find({
        userId: request.decoded.userId
      }, {
        name: 1,
        author: 1,
        collection: 1,
        illustrator: 1,
        size: 1,
        pagesNumber: 1
      }).toArray()

      if (!books.length) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'No book found'
        })
      }

      return response.status(200).json({
        status: 200,
        success: true,
        books: books
      })
    } catch (err) {
      next(err)
    }
  },

  async getOne (request, response, next) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    try {
      const book = await db.collection('books').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        }, {
          name: 1,
          size: 1,
          author: 1,
          collection: 1,
          illustrator: 1,
          pagesNumber: 1
        })

      if (!book) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Book not found'
        })
      }

      return response.status(200).json({
        status: 200,
        success: true,
        book: book
      })
    } catch (err) {
      next(err)
    }
  },

  async getPage (request, response, next) {
    const db = database.get()
    const bucket = database.bucket()
    const ObjectId = require('mongodb').ObjectId

    try {
      const book = await db.collection('books').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        })

      if (!book || (parseInt(request.params.pid) > (book.pagesNumber - 1))) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Page not found'
        })
      }

      await mkdirp(tmp)
      const file = book.content[request.params.pid]
      await bucket.find({ _id: ObjectId(file.fileId) })
      await utils.writeFileAsync(path.join(tmp, file.name), '')
      await bucket.openDownloadStreamByName(file.name)
        .pipe(fs.createWriteStream(path.join(tmp, file.name)))
        .on('finish', function () {
          utils.readdirAsync(tmp)
            .then((items) => utils.encodeBase64(path.join(tmp, items[0])))
            .then((p) => {
                response.status(200).json({
                  status: 200,
                  success: true,
                  page: p
                })
              })
            .then(() => utils.removeContentDirectory(dir))
            .catch((err) => console.log(err))
        })
    } catch (err) {
      next(err)
    }
  },

  async create (request, response, next) {
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
            {userId: request.decoded.userId},
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

      await handler(request.file.path, tmp)
      const items = await utils.readdirAsync(tmp)
      for (let item of items) {
        const data = await fs.createReadStream(path.join(tmp, item))
          .pipe(bucket.openUploadStream(item))
        pages.push({
          id: index++,
          name: data.filename,
          fileId: data.id
        })
      }

      await db.collection('books').insertOne({
        name: request.file.originalname.slice(0, -4),
        hashname: request.file.filename,
        author: 'No author informed',
        collection: 'No collection informed',
        illustrator: 'No illustrator informed',
        userId: request.decoded.userId,
        encoding: request.file.encoding,
        mimetype: request.file.mimetype,
        size: request.file.size,
        pagesNumber: index,
        content: pages
      })

      return response.status(201).json({
        status: 201,
        success: true,
        message: 'Book created successfully'
      })
    } catch (err) {
      next(err)
    } finally {
      await utils.removeContentDirectory(dir)
    }
  },

  update (request, response, next) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Book updated successfully'
    })
  },

  delete (request, response, next) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Book deleted successfully'
    })
  }
}

module.exports = books
