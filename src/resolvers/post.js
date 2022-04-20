module.exports = {
  author: async (post, args, { models }) => {
    return await models.User.findById(post.author)
  },
  favoritedBy: async (post, args, { models }) => {
    return await models.User.find({ _id: { $in: post.favoritedBy } })
  },
}
