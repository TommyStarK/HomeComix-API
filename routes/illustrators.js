const database = require('../database.js')

const illustrators = {

  async getAll (request, response, next) {
    const db = database.get()

    try {
      const docs = await db.collection('illustrators').find({
        userId: request.decoded.userId
      }).toArray()

      if (!docs.length) {
        return response.status(404).json({
          status: 404,
          success: false,
          message: 'No illustrator found'
        })
      }

      return response.status(200).json({
        status: 200,
        success: true,
        books: docs
      })
    } catch (err) {
      next(err)
    }
  },

  getOne (request, response, next) {
    let illustrator
    return response.status(200).json({
      status: 200,
      success: true,
      illustrator: illustrator
    })
  },

  create (request, response, next) {
    return response.status(201).json({
      status: 201,
      success: true,
      message: 'Illustrator created successfully'
    })
  },

  update (request, response, next) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Illustrator updated successfully'
    })
  },

  delete (request, response, next) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: 'Illustrator deleted successfully'
    })
  }
}

module.exports = illustrators
