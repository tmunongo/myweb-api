const { gql } = require('apollo-server-express')

module.exports = gql`
  scalar DateTime
  scalar JSON
  type Post {
    id: ID!
    title: String!
    slug: String!
    blurb: String!
    caption: String!
    category: String!
    content: String!
    author: User!
    coverUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
    favoriteCount: Int!
    favoritedBy: [User!]
  }
  type Comment {
    id: ID!
    author: User!
    content: String!
    createdAt: DateTime!
    favoriteCount: Int!
    favoritedBy: [User!]
  }
  type User {
    id: ID!
    fullname: String!
    username: String!
    email: String!
    role: String!
    avatar: String
    posts: [Post!]!
    comments: [Comment!]!
    favorites: [Post!]!
  }
  type Query {
    posts: [Post!]!
    users: [User!]!
    post(id: ID!): Post!
    postBySlug(slug: String!): Post!
    user(username: String!): User
    me: User!
    PostFeed(cursor: String): PostFeed
    CommentFeed(cursor: String): CommentFeed
  }
  type Mutation {
    newPost(
      blurb: String!
      caption: String!
      category: String!
      content: String!
      coverUrl: String!
      slug: String!
      title: String!
    ): Post!
    newComment(content: String!): Comment!
    updatePost(
      id: ID!
      title: String
      caption: String
      blurb: String
      category: String
      content: String
      coverUrl: String
      slug: String
    ): Post!
    updateUser(
      id: ID!
      fullname: String!
      email: String!
      username: String!
    ): User!
    deletePost(id: ID!): Boolean!
    deleteComment(id: ID!): Boolean!
    deleteUser(id: ID!): Boolean!
    signUp(
      username: String!
      fullname: String!
      email: String!
      password: String!
      role: String
    ): String!
    signIn(username: String, email: String, password: String!): String!
    toggleFavorite(id: ID!): Post!
    toggleCommentFavorite(id: ID!): Comment!
    toggleRole(id: ID!): Boolean!
  }
  type PostFeed {
    posts: [Post]!
    cursor: String!
    hasNextPage: Boolean!
  }
  type CommentFeed {
    comments: [Comment]!
    commentCursor: String!
    commentNextPage: Boolean!
  }
`
