module.exports = {
  //resolve the list of posts for a user when requested
  posts: async (user, args, { models }) => {
    return await models.Post.find({ author: user._id }).sort({ _id: -1 })
  },
  //resolve the list of favorites for a user when requested
  favorites: async (user, args, { models }) => {
    return await models.Post.find({ favoritedBy: user._id }).sort({ _id: -1 })
  },
}
