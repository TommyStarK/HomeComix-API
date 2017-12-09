const database = require('../database.js')

const illustrators = {

  async getAll (request, response) {
    const db = database.get()

    try {
      // TODO: request.decoded.userId
      const docs = await db.collection('illustrators').find({
        userId: request.params.uid
      }).toArray()

      return response.status(200).json({
        status: 200,
        success: true,
        message: 'GET all illustrators',
        books: docs
      })
    } catch (err) {
      console.log(err)
      database.close()
      return response.status(500).json({
        status: 500,
        success: false,
        message: 'Internal server error'
      })
    }
  },

  getOne (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: `GET one illustrator with id: ${request.params.id}`
    })
  },

  create (request, response) {
    return response.status(201).json({
      status: 201,
      success: true,
      message: 'CREATE illustrator',
      body: request.body
    })
  },

  update (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: `UPDATE illustrator with id: ${request.params.id}`,
      body: request.body
    })
  },

  delete (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: `DELETE illustrator with id: ${request.params.id}`
    })
  }
}

module.exports = illustrators
