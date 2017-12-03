const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

let _db
let _bucket

const database = {
  connect (callback) {
    MongoClient.connect('mongodb://localhost:27017/homecomix-db', (err, db) => {
      _db = db
      _bucket = new mongodb.GridFSBucket(db)
      return callback(err)
    })
  },

  async init () {
    let map = new Map()
    const db = database.get()
    let collectionsToCreate = []
    const collectionsRequired = [
      {name: 'users', func: database.initUsers},
      {name: 'books', func: database.initBooks},
      {name: 'authors', func: database.initAuthors},
      {name: 'collections', func: database.initCollections},
      {name: 'illustrators', func: database.initIllustrators}
    ]

    try {
      let collections = await db.listCollections().toArray()
      collections = collections.map((item) => {
        return item.name
      })
      collections.forEach(map.set.bind(map))
      collectionsRequired.forEach(target => {
        if (!map.has(target.name)) {
          collectionsToCreate.push(target.func)
        }
      })
      collectionsToCreate.forEach(func => {
        func()
      })
      return true
    } catch (err) {
      console.log(err)
      database.close()
      return false
    }
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
    console.log('init authors collection')
  },

  initCollections () {
    console.log('init collections collection')
  },

  initIllustrators () {
    console.log('init illustrators collection')
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
