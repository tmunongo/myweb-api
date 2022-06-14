const mongoose = require('mongoose')
require('dotenv').config()

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
