const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  favoriteCount: {
    type: Number,
    default: 0,
  },
  favoriteBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  avatar: {
    type: String,
  },
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
