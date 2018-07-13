const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const router = require('./routes/router.js')
const database = require('./database.js')
const account = require('./account/manager.js')

const success = '\x1b[32mOK\x1b[0m'
const failure = '\x1b[31mFAILED\x1b[0m'
const homecomixApi = '[\x1b[35mHomeComix-API\x1b[0m] '

const app = express()

// Port setting
const port = process.env.PORT || 3000

// Enable all CORS request
app.use(cors())
// Allows nested object
app.use(bodyParser.urlencoded({extended: true}))
// Parses incoming request bodies in a middleware
app.use(bodyParser.json())

// Account management
app.post('/api.homecomix/register', account.register)
app.post('/api.homecomix/authorize', account.authorize)
app.delete('/api.homecomix/delete', account.delete)

// Middlewares
// Ensures that all requests starting with /api.homecomix/* will be checked
// for the token
app.all('/api.homecomix/*', [require('./middleware/token')])

// Mounts the router as middleware at path "/"
app.use('/', router)

database.connect()
  .then(() => {
    console.log(`${homecomixApi}Connection to the database [${success}]`)
    database.init()
      .then(() => {
        app.listen(port, () => {
          console.log(`${homecomixApi}Listening on port ${port} [${success}]`)
          console.log(`${homecomixApi}HomeComix starting service [${success}]`)
        })
      })
      .catch(err => {
        console.log(`${homecomixApi}HomeComix starting service [${failure}]`)
        console.log(err.message)
        database.close()
        process.exit(1)
      })
  })
  .catch(err => {
    if (err) {
      console.log(`${homecomixApi}Connection to the database [${failure}]`)
      console.log(err.message)
      process.exit(1)
    }
  })
