const mongo = require('mongodb')
const jwt = require('jsonwebtoken')
const database = require('../database.js')

module.exports = (request, response, next) => {
  const token = (request.body && request.body.access_token) ||
      (request.query && request.query.access_token) ||
      request.headers['x-access-token'] || request.headers.authorization

  if (token) {
    const db = database.get()

    jwt.verify(token, '1S3cR€T!', (err, decoded) => {
      if (err) {
        return response.status(401).json({
          status: 401,
          success: false,
          message: 'Invalid token'
        })
      }

      request.decoded = decoded
      try {

        // TODO: decoded.userId
        db.collection('users')
          .findOne({ _id: new mongo.ObjectID(request.params.uid) })
          .then(doc => {
            if (doc === null) {
              return response.status(401).json(
                {status: 401, success: false, message: 'Nonexistent account'})
            }

            // TODO: REMOVE THIS SECTION
            if (doc._id.toString() !== decoded.userId ||
              request.params.uid !== doc._id.toString() ||
              request.params.uid !== decoded.userId) {
              return response.status(400).json(
                {status: 400, success: false, message: 'Bad request'})
            }

            next()
          })
      } catch (err) {
        return response.status(500).json(
          { status: 500, success: false, message: 'Internal server error' })
      }
    })
  } else {
    return response.status(401).json(
        {status: 401, success: false, message: 'No token provided'})
  }
}
