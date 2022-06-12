const Query = require('./query')
const Mutation = require('./mutation')
const Post = require('./post')
const User = require('./user')
const Comment = require('./comment')
const { DateTimeResolver } = require('graphql-scalars')

module.exports = {
  Query,
  Mutation,
  Post,
  User,
  Comment,
  DateTime: DateTimeResolver,
}
