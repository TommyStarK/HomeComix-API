const mongodb = require('mongodb')
const config = require('./config.js')
const MongoClient = mongodb.MongoClient

let _db
let _bucket

const database = {
  connect () {
    return new Promise((resolve, reject) => {
      let url = 'mongodb://'

      if (config.mongo.auth) {
        url += config.mongo.username +
          ':' + config.mongo.username +
          '@' + config.mongo.uri +
          ':' + config.mongo.port +
          '/' + config.mongo.database
      } else {
        url += config.mongo.uri +
        ':' + config.mongo.port +
        '/' + config.mongo.database
      }

      MongoClient.connect(url, (err, db) => {
        if (err) {
          reject(err)
        } else {
          try {
            _db = db
            _bucket = new mongodb.GridFSBucket(db)
            resolve(db)
          } catch (err) {
            reject(err)
          }
        }
      })
    })
  },

  init () {
    return new Promise((resolve, reject) => {
      let map = new Map()
      const db = database.get()
      const collectionsRequired = [
        {name: 'users', func: database.initUsers},
        {name: 'books', func: database.initBooks},
        {name: 'authors', func: database.initAuthors},
        {name: 'collections', func: database.initCollections},
        {name: 'illustrators', func: database.initIllustrators}
      ]

      db.listCollections().toArray((error, collections) => {
        if (error) {
          reject(error)
        } else {
          try {
            collections = collections.map((item) => {
              return item.name
            })

            collections.forEach(map.set.bind(map))

            collectionsRequired.forEach(target => {
              if (!map.has(target.name)) {
                target.func()
              }
            })

            resolve(collections)
          } catch (err) {
            reject(err)
          }
        }
      })
    })
  },

  initUsers () {
    const db = database.get()

    db.createCollection('users', { validator:
    { $and:
    [
      { username: { $type: 'string' } },
      { email: { $type: 'string' } },
      { password: { $type: 'string' } }
    ]
    },
      validationLevel: 'strict',
      validationAction: 'error'
    })
  },

  initBooks () {
    const db = database.get()

    db.createCollection('books', { validator:
    { $and:
    [
      { name: { $type: 'string' } },
      { author: { $type: 'string' } },
      { collection: { $type: 'string' } },
      { illustrator: { $type: 'string' } },
      { hashname: { $type: 'string' } },
      { userId: { $type: 'string' } },
      { encoding: { $type: 'string' } },
      { mimetype: { $type: 'string' } },
      { size: { $type: 'int' } },
      { pagesNumber: { $type: 'int' } },
      { content: [
        { id: { $type: 'string' } },
        { name: { $type: 'string' } },
        { fileId: { $type: 'string' } }
      ]
      }
    ]
    },
      validationLevel: 'strict',
      validationAction: 'warn'
    })
  },

  initAuthors () {
    const db = database.get()

    db.createCollection('authors', { validator:
      { $and:
      [
        { name: { $type: 'string' } },
        { userId: { $type: 'string' } },
        { books: [
          { id: { $type: 'string' } }
        ]
        }
      ]
      },
        validationLevel: 'strict',
        validationAction: 'warn'
    })
  },

  initCollections () {
    const db = database.get()

    db.createCollection('collections', { validator:
      { $and:
      [
        { name: { $type: 'string' } },
        { userId: { $type: 'string' } },
        { books: [
          { id: { $type: 'string' } }
        ]
        }
      ]
      },
        validationLevel: 'strict',
        validationAction: 'warn'
    })
  },

  initIllustrators () {
    const db = database.get()

    db.createCollection('illustrators', { validator:
      { $and:
      [
        { name: { $type: 'string' } },
        { userId: { $type: 'string' } },
        { books: [
          { id: { $type: 'string' } }
        ]
        }
      ]
      },
        validationLevel: 'strict',
        validationAction: 'warn'
    })
  },

  get () {
    return _db
  },

  bucket () {
    return _bucket
  },

  close () {
    _db.close()
  }
}

module.exports = database
