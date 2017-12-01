const database = require('../database.js')

const books = {

  async getAll (request, response) {
    const db = database.get()

    try {
      const books = await db.collection('books').find({}).toArray()
      return response.status(200).json({
        status: 200,
        success: true,
        message: 'GET all books',
        books: books
      })
    } catch (err) {
      console.log(err)
      database.close()
      return response.status(500).json(
          {status: 500, success: false, message: 'Internal server error'})
    }
  },

  getOne (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: `GET one book with id: ${request.params.id}`
    })
  },

  getPage (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: `GET page of book with id: ${request.params.id} page number: ${request.params.pid}`
    })
  },

  create (request, response) {
    return response.status(201).json(
        {status: 201, success: true, message: 'CREATE book success'})
  },

  update (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: `UPDATE book with id: ${request.params.id}`,
      body: request.body
    })
  },

  delete (request, response) {
    return response.status(200).json({
      status: 200,
      success: true,
      message: `DELETE book with id: ${request.params.id}`
    })
  }
}

module.exports = books
