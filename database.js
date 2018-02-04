const mongodb = require('mongodb')
const config = require('./config.js')
const MongoClient = mongodb.MongoClient

let _db
let _bucket

const database = {
  async connect () {
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

    try {
      _db = await MongoClient.connect(url)
      _bucket = new mongodb.GridFSBucket(_db)
    } catch (err) {
      console.log(err)
    }
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

  initBooks () {
    const db = database.get()

    db.createCollection('books', {validator: {
      $jsonSchema: {
        bsonType: 'object',
        properties: {
          title: {
            bsonType: 'string',
            description: 'must be a string'
          },
          year: {
            bsonType: 'string',
            description: 'must be a string'
          },
          description: {
            bsonType: 'string',
            description: 'must be a string'
          },
          authors: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                id: {
                  bsonType: 'objectId',
                  description: 'must be a MongoDB ObjectId'
                },
                name: {
                  bsonType: 'string',
                  description: 'must be a string'
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
                  bsonType: 'objectId',
                  description: 'must be a MongoDB ObjectId'
                },
                name: {
                  bsonType: 'string',
                  description: 'must be a string'
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
                  bsonType: 'objectId',
                  description: 'must be a MongoDB ObjectId'
                },
                name: {
                  bsonType: 'string',
                  description: 'must be a string'
                }
              }
            }
          },
          hashname: {
            bsonType: 'string',
            description: 'must be a string'
          },
          userId: {
            bsonType: 'string',
            description: 'must be a string'
          },
          encoding: {
            bsonType: 'string',
            description: 'must be a string'
          },
          mimetype: {
            bsonType: 'string',
            description: 'must be a string'
          },
          size: {
            bsonType: 'int',
            description: 'must be an integer'
          },
          pagesNumber: {
            bsonType: 'int',
            description: 'must be an integer'
          },
          content: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                id: {
                  bsonType: 'int',
                  description: 'must be an integer'
                },
                name: {
                  bsonType: 'string',
                  description: 'must be a string'
                },
                fileId: {
                  bsonType: 'objectId',
                  description: 'must be a MongoDB ObjectId'
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

    db.createCollection('authors', {validator: {
      $jsonSchema: {
        bsonType: 'object',
        properties: {
          name: {
            bsonType: 'string',
            description: 'must be a string'
          },
          description: {
            bsonType: 'string',
            description: 'must be a string'
          },
          userId: {
            bsonType: 'string',
            description: 'must be a string'
          },
          books: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                id: {
                  bsonType: 'objectId',
                  description: 'must be a MongoDB ObjectId'
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

  initCollections () {
    const db = database.get()

    db.createCollection('collections', {validator: {
      $jsonSchema: {
        bsonType: 'object',
        properties: {
          name: {
            bsonType: 'string',
            description: 'must be a string'
          },
          description: {
            bsonType: 'string',
            description: 'must be a string'
          },
          userId: {
            bsonType: 'string',
            description: 'must be a string'
          },
          books: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                id: {
                  bsonType: 'objectId',
                  description: 'must be a MongoDB ObjectId'
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

  initIllustrators () {
    const db = database.get()

    db.createCollection('illustrators', {validator: {
      $jsonSchema: {
        bsonType: 'object',
        properties: {
          name: {
            bsonType: 'string',
            description: 'must be a string'
          },
          description: {
            bsonType: 'string',
            description: 'must be a string'
          },
          userId: {
            bsonType: 'string',
            description: 'must be a string'
          },
          books: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              properties: {
                id: {
                  bsonType: 'objectId',
                  description: 'must be a MongoDB ObjectId'
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
