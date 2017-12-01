const jwt = require('jsonwebtoken')
const utils = require('../utils.js')
const database = require('../database.js')

const account = {

  async register (request, response) {
    const db = database.get()

    if (request.body.username === undefined ||
        request.body.password === undefined ||
        request.body.email === undefined) {
      return response.status(400).json({
        status: 400,
        success: false,
        message: 'Body missing username/email/password field'
      })
    }

    if (utils.validateEmail(request.body.email) === false) {
      return response.status(400).json(
          {status: 400, success: false, message: 'Invalid email'})
    }

    try {
      const doc = await db.collection('users').findOne(
        {
          $or: [
            {username: request.body.username},
            {email: utils.hash(request.body.email)}
          ]
        })

      if (doc) {
        const t =
            doc.username === request.body.username ? 'Username' : 'Email'
        return response.status(409).json({
          status: 409,
          success: false,
          message: `Conflict: ${t} already used`
        })
      }

      await db.collection('users').insertOne(
        {
          username: request.body.username,
          password: utils.hash(request.body.password),
          email: utils.hash(request.body.email)
        })

      return response.status(201).json({
        status: 201,
        success: true,
        message: 'Account registration succeed'
      })
    } catch (err) {
      console.log(err)
      database.close()
      return response.status(500).json(
          {status: 500, success: false, message: 'Internal server error'})
    }
  },

  async authorize (request, response) {
    const db = database.get()

    if (request.body.username === undefined ||
        request.body.password === undefined) {
      return response.status(400).json({
        status: 400,
        success: false,
        message: 'Body missing username/password field'
      })
    }

    try {
      const doc = await db.collection('users').findOne(
        {
          username: request.body.username,
          password: utils.hash(request.body.password)
        })

      if (doc) {
        const payload = {username: doc.username, userId: doc._id}
        const newToken = await jwt.sign(payload, '1S3cR€T!', {expiresIn: '24h'})
        return response.status(200).json({
          status: 200,
          success: true,
          userId: doc._id,
          token: newToken
        })
      } else {
        return response.status(401).json(
            {status: 401, success: false, message: 'Wrong credentials'})
      }
    } catch (err) {
      console.log(err)
      database.close()
      return response.status(500).json(
          {status: 500, success: false, message: 'Internal server error'})
    }
  },

  async delete (request, response) {
    const db = database.get()

    if (request.body.username === undefined ||
        request.body.password === undefined) {
      return response.status(400).json({
        status: 400,
        success: false,
        message: 'Body missing username/password field'
      })
    }

    try {
      const doc = await db.collection('users').findOneAndDelete(
        {
          username: request.body.username,
          password: utils.hash(request.body.password)
        })

      if (doc && doc.value !== null) {
        return response.status(200).json({
          status: 200,
          success: true,
          message: 'Account deleted successfully'
        })
      }

      return response.status(401).json(
          {status: 401, success: false, message: 'Wrong credentials'})
    } catch (err) {
      console.log(err)
      database.close()
      return response.status(500).json(
          {status: 500, success: false, message: 'Internal server error'})
    }
  }

}

module.exports = account
