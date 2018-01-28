
module.exports = {
  hash (target) {
    const hash = require('crypto').createHash('sha256')
    hash.update(target)
    return hash.digest('hex')
  },

  validateEmail (email) {
    let re =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  },

  unrar (target, destination) {
    return new Promise((resolve, reject) => {
      const Unrar = require('node-unrar')
      const rar = new Unrar(target)
      require('mkdirp')(destination)
      rar.extract(destination, null, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  },

  unzip (target, destination) {
    return new Promise((resolve, reject) => {
      const unzip = require('cross-unzip')
      require('mkdirp')(destination)
      unzip(target, destination, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  },

  archiveHandler (extension) {
    if (extension === '.cbr') {
      return this.unrar
    } else if (extension === '.cbz') {
      return this.unzip
    } else {
      return new Error('Extension file invalid: Unable to unpack file')
    }
  },

  readFileAsync (file) {
    return new Promise((resolve, reject) => {
      require('fs').readFile(file, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  },

  writeFileAsync (file, content) {
    return new Promise((resolve, reject) => {
      require('fs').writeFile(file, content, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  },

  readdirAsync (path) {
    return new Promise((resolve, reject) => {
      require('fs').readdir(path, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  },

  statAsync (path) {
    return new Promise((resolve, reject) => {
      require('fs').stat(path, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  },

  unlinkAsync (path) {
    return new Promise((resolve, reject) => {
      require('fs').unlink(path, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  },

  async removeContentDirectory (target) {
    try {
      const files = await this.readdirAsync(target)
      for (let file of files) {
        const filePath = require('path').join(target, file)
        const stat = await this.statAsync(filePath)
        if (stat.isFile(filePath)) {
          await this.unlinkAsync(filePath)
        } else {
          this.removeContentDirectory(filePath)
        }
      }
    } catch (err) {
      console.log(err)
    }
  },

  async encodeBase64 (file) {
    try {
      const data = await this.readFileAsync(file)
      return Buffer.from(data).toString('base64')
    } catch (err) {
      return err
    }
  },

  bodyHandler(request) {
    let body = {
      name: '',
      description: '',
      books: []
    }

    for (let item in request.body) {
      if (!['name', 'description', 'books'].includes(item)) {
        body['notSupported'] = item
        return body
      }

      if (['name', 'description'].includes(item)) {
          if (Array.isArray(request.body[item])) {
              body['notValid'] = item
              return body
            }
           body[item] = request.body[item]
       } else if (Array.isArray(request.body[item])) {
         for (let index in request.body[item]) {
           body[item].push({
             id: '',
             title: request.body[item][index]
           })
         }
       } else {
           body[item].push({
              id: '',
              title: request.body[item]
          })
       }
    }

    return body
  },

  async retrieveBookID(body, userId) {
    const db = require('./database.js').get()

    for (let item in body.books) {
      const book = await db.collection('books').findOne(
        {
          title: body.books[item].title,
          userId: userId
        })

      if (book) {
        body.books[item].id = book._id
        delete body.books[item].title
      } else {
        body['notFound'] = body.books[item].title
        return body
      }
    }
    return body
  }
}
