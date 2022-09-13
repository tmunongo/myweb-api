const {
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");

//resolver functions for schema fields
module.exports = {
  posts: async (parent, args, { models }) => {
    return await models.Post.find().limit(100);
  },
  post: async (parent, args, { models }) => {
    return await models.Post.findById(args.id);
  },
  postBySlug: async (parent, args, { models }) => {
    return await models.Post.findOne({ slug: args.slug });
  },
  postsByTag: async (parent, args, { models }) => {
    return await models.Post.find({ category: args.tag });
  },
  user: async (parent, args, { models }) => {
    return await models.User.findOne({ username: args.username });
  },
  users: async (parent, args, { models, user }) => {
    //find all users
    return await models.User.find({});
  },
  me: async (parent, args, { models, user }) => {
    //find a user given the current user context
    return await models.User.findById(user.id);
  },
  PostFeed: async (parent, { cursor }, { models }) => {
    //limit is 10 items
    const limit = 10;
    //false by default
    let hasNextPage = false;
    //without cursor, default empty, pull newest from db
    let cursorQuery = {};
    //with cursor
    if (cursor) {
      cursorQuery = { _id: { $lt: cursor } };
    }
    //find the limit + 1 of posts in our db, newest to oldest
    let posts = await models.Post.find(cursorQuery)
      .sort({ _id: -1 })
      .limit(limit + 1);

    //if the number of posts exceeds the limit
    //set hasNextPage to true and trim
    if (posts.length > limit) {
      hasNextPage = true;
      posts = posts.slice(0, -1);
    }
    //the new cursor is mongodb obj id of last item
    const newCursor = posts[posts.length - 1]._id;

    return {
      posts,
      cursor: newCursor,
      hasNextPage,
    };
  },
  CommentFeed: async (parent, { commentCursor }, { models }) => {
    // limit is 5 items
    const commentLimit = 5;
    //next page false by default
    const commentNextPage = false;
    // set cursor query
    let commentCursorQuery = {};
    //if there is a cursor, find post with obj id less than it
    if (commentCursor) {
      commentCursorQuery = { _id: { $lt: commentCursor } };
    }
    //find limit + 1 of db posts, newest to oldest
    let posts = await models.Post.find(commentCursorQuery)
      .sort({ _id: -1 })
      .limit(commentLimit + 1);

    //if more posts than limit, commentNextPage is true
    if (posts.length > commentLimit) {
      commentNextPage = true;
      posts = posts.slice(0, -1);
    }

    //set new cursor to mongo obj id of last item
    const newCommentCursor = posts[posts.length - 1]._id;

    return {
      posts,
      commentCursor: newCommentCursor,
      commentNextPage,
    };
  },
};
