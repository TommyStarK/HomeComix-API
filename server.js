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

// Allows nested object
app.use(bodyParser.urlencoded({extended: true}))
// Parses incoming request bodies in a middleware
app.use(bodyParser.json())

// Account management
app.post('/api.homecomix/register', account.register)
app.post('/api.homecomix/authorize', account.authorize)
app.delete('/api.homecomix/delete', account.delete)

app.get('/api.homecomix/users', (request, response) => {
  const db = database.get()

  try {
    db.collection('users').find({}).toArray((err, docs) => {
      if (err) {
        throw (err)
      }

      return response.status(200).json(
          {status: 200, success: true, message: 'GET all users', users: docs})
    })
  } catch (err) {
    console.log(err)
    database.close()
    return response.status(500).json(
        {status: 500, success: false, message: 'Internal server error'})
  }
})

// Middlewares
// Ensures that all requests starting with /api.homecomix/:uid/* will be checked
// for the token
app.all('/api.homecomix/:uid/*', [require('./middleware/token')])

// Mounts the router as middleware at path "/"
app.use('/', router)

// Starts the server
app.listen(port, () => {
  console.log(`${homecomixApi}Server listening on port ${port} [${success}]`)
  database.connect(err => {
    if (err) {
      console.log(`${homecomixApi}Connection to the database [${failure}]`)
      throw (err)
    } else {
      console.log(`${homecomixApi}Connection to the database [${success}]`)
      database.init().then(result => {
        const res = result === true ? success : failure
        console.log(`${homecomixApi}HomeComix starting service [${res}]`)
      })
    }
  })
})
