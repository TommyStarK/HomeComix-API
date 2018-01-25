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
      const books = await db.collection('books').find(
        {
          userId: request.decoded.userId
        },
        {
          title: 1,
          year: 1,
          description: 1,
          authors: 1,
          collections: 1,
          illustrators: 1,
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
          title: 1,
          year: 1,
          description: 1,
          authors: 1,
          collections: 1,
          illustrators: 1,
          size: 1,
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

  bodyHandler (request) {
    let body = {
      title: '',
      year: '',
      description: '',
      authors: [],
      collections: [],
      illustrators: []
    }

    for (let item in request.body) {
      if (!['title',
        'year',
        'description',
        'authors',
        'collections',
        'illustrators'].includes(item)) {
        body['notSupported'] = item
        return body
      }

      switch (item) {
        case 'title':
          body.title = request.body[item]
          if (Array.isArray(request.body[item])) {
            body['notValid'] = item
            return body
          }
          break
        case 'year':
          body.year = request.body[item]
          if (Array.isArray(request.body[item])) {
            body['notValid'] = item
            return body
          }
          break
        case 'description':
          body.description = request.body[item]
          if (Array.isArray(request.body[item])) {
            body['notValid'] = item
            return body
          }
          break
        default:
          if (Array.isArray(request.body[item])) {
            for (let index in request.body[item]) {
              body[item].push({
                id: '',
                name: request.body[item][index]
              })
            }
          } else {
            body[item].push({
              id: '',
              name: request.body[item]
            })
          }
          break
      }
    }

    return body
  },

  async createHandler (name, data, userId, body) {
    const db = database.get()

    for (let item in data) {
      let result = await db.collection(name).findOne(
        {
          name: data[item].name,
          userId: userId
        })

      if (!result) {
        result = await db.collection(name).insertOne({
          name: data[item].name,
          description: '',
          userId: userId,
          books: []
        })
        body[name][item].id = result.insertedId
      } else {
        body[name][item].id = result._id
      }
    }
  },

  async updateHandler (target, data, userId, bookId) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    for (let item in data) {
      await db.collection(target).updateOne(
        {
          _id: ObjectId(data[item].id),
          name: data[item].name,
          userId: userId
        },
        {
          $addToSet: {
            books: {id: ObjectId(bookId)}
          }
        })
    }
  },

  async create (request, response, next) {
    const db = database.get()
    const bucket = database.bucket()

    if (typeof request.file === 'undefined') {
      return response.status(422).json({
        status: 422,
        success: false,
        message: 'Unprocessable entity'
      })
    }

    let body = books.bodyHandler(request)

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
      const handler = utils.archiveHandler(extension(request.file.originalname))

      if (handler instanceof Error) {
        throw (handler)
      }

      const doc = await db.collection('books').findOne(
        {
          title: request.file.originalname.slice(0, -4),
          userId: request.decoded.userId
        })

      if (doc) {
        return response.status(409).json({
          status: 409,
          success: false,
          message: `Conflict: Book '${request.file.originalname.slice(0, -4)}' already exists`
        })
      }

      let index = 0
      let pages = []
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

      for (let elem in body) {
        if (Array.isArray(body[elem])) {
          await books.createHandler(
            elem,
            body[elem],
            request.decoded.userId,
            body
          )
        }
      }

      const result = await db.collection('books').insertOne({
        title: request.file.originalname.slice(0, -4),
        year: body.year,
        description: body.description,
        authors: body.authors,
        collections: body.collections,
        illustrators: body.illustrators,
        hashname: request.file.filename,
        userId: request.decoded.userId,
        encoding: request.file.encoding,
        mimetype: request.file.mimetype,
        size: request.file.size,
        pagesNumber: index,
        content: pages
      })

      for (let elem in body) {
        if (Array.isArray(body[elem])) {
          await books.updateHandler(
            elem,
            body[elem],
            request.decoded.userId,
            result.insertedId
          )
        }
      }

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

  async update (request, response, next) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    let body = books.bodyHandler(request)

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
      const book = await db.collection('books').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        })

      if (!book) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Book not found'
        })
      }

      for (let elem in body) {
        if (Array.isArray(body[elem])) {
          await books.createHandler(
            elem,
            body[elem],
            request.decoded.userId,
            body
          )
        }

        if ((body[elem] === '') || (Array.isArray(body[elem]) && !body[elem].length)) {
          delete body[elem]
        }
      }

      await db.collection('books').updateOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          $set: body
        })

      for (let elem in body) {
        if (Array.isArray(body[elem])) {
          await books.updateHandler(
            elem,
            body[elem],
            request.decoded.userId,
            request.params.id
          )
        }
      }

      return response.status(200).json({
        status: 200,
        success: true,
        message: 'Book updated successfully'
      })
    } catch (err) {
      next(err)
    }
  },

  async delete (request, response, next) {
    const db = database.get()
    const ObjectId = require('mongodb').ObjectId

    try {
      const book = await db.collection('books').findOne(
        {
          _id: ObjectId(request.params.id),
          userId: request.decoded.userId
        },
        {
          authors: 1,
          collections: 1,
          illustrators: 1
        })

      if (!book) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'Book not found'
        })
      }

      const doc = await db.collection('books').findOneAndDelete(book)

      if (doc && doc.value !== null) {
        let collections = {
          'authors': book.authors,
          'collections': book.collections,
          'illustrators': book.illustrators
        }

        for (let elem in collections) {
          for (let item in collections[elem]) {
            await db.collection(elem).updateOne(
              {
                _id: ObjectId(collections[elem][item].id),
                name: collections[elem][item].name,
                userId: request.decoded.userId
              },
              {
                $pull: {
                  books: {
                    id: book._id
                  }
                }
              })
          }
        }

        return response.status(200).json({
          status: 200,
          success: true,
          message: 'Book deleted successfully'
        })
      }

      return response.status(500).json({
        status: 500,
        success: false,
        message: 'An unexpected error occured during the deletion of the book'
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = books
