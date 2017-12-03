
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
    console.log(target)
    console.log(destination)
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
  }
}
