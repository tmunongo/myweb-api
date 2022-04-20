const Query = require('./query')
const Mutation = require('./mutation')
const Post = require('./post')
const User = require('./user')
const Comment = require('./comment')
const { GraphQLDateTime } = require('graphql-iso-date')

module.exports = {
  Query,
  Mutation,
  Post,
  User,
  Comment,
  DateTime: GraphQLDateTime,
}
