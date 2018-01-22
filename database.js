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

  // initUsers () {
  //   const db = database.get()
  //
  //   db.createCollection('users', { validator:
  //   { $and:
  //   [
  //     { username: { $type: 'string' } },
  //     { email: { $type: 'string' } },
  //     { password: { $type: 'string' } }
  //   ]
  //   },
  //     validationLevel: 'strict',
  //     validationAction: 'error'
  //   })
  // },

  initUsers () {
    const db = database.get()

    db.createCollection('users', {validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          email: {
            bsonType: 'string',
            description: 'must be a string with a valid email and is required'
          },
          password: {
            bsonType: 'string',
            description: 'must be a string and is reqired'
          }
        }
      }
    },
      validationLevel: 'strict',
      validationAction: 'error'
    })
  },

  // initBooks () {
  //   const db = database.get()
  //
  //   db.createCollection('books', { validator:
  //   { $and:
  //   [
  //     { title: { $type: 'string' } },
  //     { year: { $type: 'string' } },
  //     { description: { $type: 'string' } },
  //     { authors: [
  //       { id: { $type: 'string' } },
  //       { name: { $type: 'string' } }
  //     ]
  //     },
  //     { collections: [
  //       { id: { $type: 'string' } },
  //       { name: { $type: 'string' } }
  //     ]
  //     },
  //     { illustrators: [
  //       { id: { $type: 'string' } },
  //       { name: { $type: 'string' } }
  //     ]
  //     },
  //     { hashname: { $type: 'string' } },
  //     { userId: { $type: 'string' } },
  //     { encoding: { $type: 'string' } },
  //     { mimetype: { $type: 'string' } },
  //     { size: { $type: 'int' } },
  //     { pagesNumber: { $type: 'int' } },
  //     { content: [
  //       { id: { $type: 'string' } },
  //       { name: { $type: 'string' } },
  //       { fileId: { $type: 'string' } }
  //     ]
  //     }
  //   ]
  //   },
  //     validationLevel: 'strict',
  //     validationAction: 'warn'
  //   })
  // },

  initBooks () {
    const db = database.get()

    db.createCollection('books', {validator: {
      $jsonSchema: {
        bsonType: 'object',
        properties: {
          title: {
            bsonType: 'string',
            description: '1'
          },
          year: {
            bsonType: 'string',
            description: '2'
          },
          description: {
            bsonType: 'string',
            description: '3'
          },
          authors: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                id: {
                  bsonType: 'string',
                  description: '4'
                },
                name: {
                  bsonType: 'string',
                  description: '5'
                }
              }
            }
          },
          collections: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                id: {
                  bsonType: 'string',
                  description: '6'
                },
                name: {
                  bsonType: 'string',
                  description: '7'
                }
              }
            }
          },
          illustrators: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                id: {
                  bsonType: 'string',
                  description: '8'
                },
                name: {
                  bsonType: 'string',
                  description: '9'
                }
              }
            }
          },
          hashname: {
            bsonType: 'string',
            description: '10'
          },
          userId: {
            bsonType: 'string',
            description: '11'
          },
          encoding: {
            bsonType: 'string',
            description: '12'
          },
          mimetype: {
            bsonType: 'string',
            description: '13'
          },
          size: {
            bsonType: 'int',
            description: '14'
          },
          pagesNumber: {
            bsonType: 'int',
            description: '15'
          },
          content: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                id: {
                  bsonType: 'int',
                  description: '16'
                },
                name: {
                  bsonType: 'string',
                  description: '17'
                },
                fileId: {
                  bsonType: 'objectId',
                  description: '18'
                }
              }
            }
          }
        }
      }
    },
      validationLevel: 'strict',
      validationAction: 'error'
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
