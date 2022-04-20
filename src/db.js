const mongoose = require('mongoose')
require('dotenv').config()

DB_HOST = process.env.DB_HOST

module.exports = {
  connect: (DB_HOST) => {
    mongoose.connect(DB_HOST)

    mongoose.connection.on('error', (err) => {
      console.error(err)
      console.log(
        'MongoDB connection error. Please make sure MongoDB is running.'
      )
      process.exit()
    })
  },
}
