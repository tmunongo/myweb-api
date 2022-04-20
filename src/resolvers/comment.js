module.exports = {
  //a comment has a single author
  author: async (comment, args, { models }) => {
    return await models.User.findById(comment.author)
  },
  //a comment can be favorited by many users
  favoritedBy: async (comment, args, { models }) => {
    return await models.User.find({ _id: { $in: comment.favoritedBy } })
  },
}
