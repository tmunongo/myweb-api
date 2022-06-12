const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
require('dotenv').config()
const models = require('./models')
const db = require('./db')
const typeDefs = require('./schema')
const cors = require('cors')
const resolvers = require('./resolvers')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const depthLimit = require('graphql-depth-limit')
const { createComplexityLimitRule } = require('graphql-validation-complexity')
const { DateTimeTypeDefinition } = 'graphql-scalars'

const getUser = (token) => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      throw new Error('Session invalid')
    }
  }
}

//run server on specified port or 4321
const port = process.env.PORT || 4321
//db host as variable
const DB_HOST = process.env.DB_HOST
const app = express()

//connect to the DB
db.connect(DB_HOST)

const common = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  context: ({ req }) => {
    //get the suer token from the headers
    const token = req.headers.authorization
    //try to retrieve a user with the token
    const user = getUser(token)
    //for now, let's log the user to the console:
    //console.log(user)
    //add the db models to the context
    return { models, user }
  },
})

app.use(cors())
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }))

common.start().then((res) => {
  common.applyMiddleware({ app, path: '/realm-api' })
  app.listen({ port }, () =>
    console.log(
      `Gateway API running at port: http://localhost:${port}/realm-api`
    )
  )
})
