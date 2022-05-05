const Query = require('./query')
const Mutation = require('./mutation')
const Post = require('./post')
const User = require('./user')
const Comment = require('./comment')
const { GraphQLDateTime } = require('graphql-iso-date')
const GraphQLJSON = require('graphql-type-json')

module.exports = {
  Query,
  Mutation,
  Post,
  User,
  Comment,
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
}
