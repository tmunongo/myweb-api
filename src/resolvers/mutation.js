const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");
require("dotenv").config();
const cloudinary = require("cloudinary");
const gravatar = require("../util/gravatar");

module.exports = {
  newPost: async (
    parent,
    { title, blurb, category, content, coverUrl, slug, caption },
    { models, user }
  ) => {
    if (!user) {
      throw new AuthenticationError(
        "You must be signed in to complete this action"
      );
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    try {
      result = await cloudinary.v2.uploader.upload(coverUrl, {
        allowed_formats: ["jpg", "png", "jpeg"],
        public_id: `covers/${title}`,
        folder: "realm",
      });
    } catch (e) {
      return `Image could not be uploaded:${e.message}`;
    }
    return await models.Post.create({
      title: title,
      category: category,
      blurb: blurb,
      content: content,
      slug: slug,
      caption: caption,
      author: mongoose.Types.ObjectId(user.id),
      coverUrl: result.url,
    });
  },
  newComment: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError("You must be signed in to post a comment");
    }
    return await models.Comment.create({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id),
    });
  },
  deletePost: async (parent, { id }, { models, user }) => {
    //if not user, auth error
    if (!user) {
      throw new AuthenticationError("You must be signed in to delete");
    }
    const post = await models.Post.findById(id);
    if (post && String(post.author) !== user.id) {
      throw new ForbiddenError(
        "You do not have the requisite permission for this action!"
      );
    }
    try {
      await post.remove();
      return true;
    } catch (err) {
      return false;
    }
  },
  deleteUser: async (parent, { id }, { models, user }) => {
    //must be admin
    if (!user) {
      throw new AuthenticationError("You must be signed in to delete");
    }
    const userToBeDeleted = await models.User.findById(id);
    try {
      await userToBeDeleted.remove();
      return true;
    } catch (err) {
      return false;
    }
  },
  updateUser: async (
    parent,
    { id, fullname, username, email },
    { models, user }
  ) => {
    if (!user) {
      throw new AuthenticationError(
        "You must be signed in perform this action"
      );
    }
    const userToBeUpdated = await models.User.findById(id);
    /*
        if (post && String(post.author) !== user.id) {
            throw ForbiddenError('You do not have the requisite permission to perform this action');
        } */
    //update post and return update post
    return await models.User.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          fullname,
          username,
          email,
        },
      },
      {
        new: true,
      }
    );
  },
  deleteComment: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError("You must be signed in to delete");
    }
    const post = await models.Comment.findById(id);
    if (
      (comment && String(comment.author)) ||
      (comment && String(post.author) !== user.id)
    ) {
      throw new ForbiddenError(
        "You do not have the requisite permission for this action"
      );
    }
    try {
      await post.remove();
      return true;
    } catch (err) {
      return false;
    }
  },
  updatePost: async (
    parent,
    { content, category, blurb, title, id, slug, caption },
    { models, user }
  ) => {
    if (!user) {
      throw new AuthenticationError(
        "You must be signed in perform this action"
      );
    }
    const post = await models.Post.findById(id);
    if (post && String(post.author) !== user.id) {
      throw ForbiddenError(
        "You do not have the requisite permission to perform this action"
      );
    }
    //update post and return update post
    return await models.Post.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          content,
          category,
          blurb,
          title,
          slug,
          caption,
        },
      },
      {
        new: true,
      }
    );
  },
  signUp: async (parent, { username, email, password, role }, { models }) => {
    //normalize email
    email = email.trim().toLowerCase();
    //hash password
    const hashed = await bcrypt.hash(password, 10);
    //create the gravatar url
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        role,
        password: hashed,
      });
      //create and return json web token
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      console.log(err);
      //if problem creating account
      throw new Error("Error creating account");
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      //normalize
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }],
    });
    //if user not found, throw auth error
    if (!user) {
      throw new AuthenticationError("User not found");
    }
    //if the passwords dont match, throw auth error
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError("Credentials do not match");
    }
    //create and return the jwt
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },
  toggleFavorite: async (parent, { id }, { models, user }) => {
    //if no user context passed, throw auth error
    if (!user) {
      throw new AuthenticationError("Must be logged in for this action");
    }
    //check if user has favorited post already
    let postCheck = await models.Post.findByOne(id);
    const hasUser = postCheck.favoritedBy.indexOf(user.id);
    //if user exists in list, pull them from list and -1
    if (hasUser >= 0) {
      return await models.Post.findOneAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectID(user.id),
          },
          $inc: {
            favoriteCount: -1,
          },
        },
        {
          //set new to true to update doc
          new: true,
        }
      );
    } else {
      //if user does not exist in list, add them to list and increment by one
      return await models.Post.findOneAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectID(user.id),
          },
          $inc: {
            favoriteCount: 1,
          },
        },
        {
          new: true,
        }
      );
    }
  },
  toggleCommentFavorite: async (parent, { id }, { models, user }) => {
    //if no user context passed, throw auth error
    if (!user) {
      throw new AuthenticationError("Must be logged in for this action");
    }
    //check if user has favorited post already
    let commentCheck = await models.Comment.findByOne(id);
    const hasUser = commentCheck.favoritedBy.indexOf(user.id);
    //if user exists in list, pull them from list and -1
    if (hasUser >= 0) {
      return await models.Comment.findOneAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectID(user.id),
          },
          $inc: {
            favoriteCount: -1,
          },
        },
        {
          //set new to true to update doc
          new: true,
        }
      );
    } else {
      //if user does not exist in list, add them to list and increment by one
      return await models.Comment.findOneAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectID(user.id),
          },
          $inc: {
            favoriteCount: 1,
          },
        },
        {
          new: true,
        }
      );
    }
  },
  toggleRole: async (parent, { id }, { models, user }) => {
    if (!user && String(user.role) !== "admin") {
      throw new AuthenticationError(
        "You do not have the permission to perform this action"
      );
    }
    const userToBeModified = await models.User.findById(id);
    return await models.User.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          role,
        },
      },
      {
        new: "admin",
      }
    );
  },
};
