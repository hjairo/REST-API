'use strict';

// Load modules
const { User, Course } = require('../models');
const auth = require("basic-auth");
const bcrypt = require('bcrypt');

// Handler function that uses the try/catch method for routes
const asyncHandler = (cb) => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // forwards errors to global handler
      next(error);
    }
  }
}

// Middleware to authenticate the request using Basic Authentication
const authenticateUser = async (req, res, next) => {
  let message;

  const credentials = auth(req);

  if (credentials) {
    const user = await User.findOne({ 
      where: {
        emailAddress: credentials.name
      } 
    });
    if (user) {
      const authenticated = bcrypt
        .compareSync(credentials.pass, user.password);
      if (authenticated) {
        console.log(`Authentication successful for email: ${user.emailAddress }`);

        // Store the user on the Request object
        req.currentUser = user;
      } else {
        message = `Authentication failure for email: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  if (message) {
    console.warn(message);
    res
    .status(401)
    .json({ 
      message: 'Access Denied'
    });
  } else {
    next();
  }
};

// Middleware that compares the currentUser.id to the userId of the course being modified and allows modification if the user is authorized
const modifyCourse = async (req, res, id, action) => {
  let description = req.body.description || "";
  let title = req.body.title || "";
  const course = await Course.findByPk(id);
  let message = 'Course does not exist';

  if (course) {
    if (course.userId === req.currentUser.id) {
      (action === "destroy") 
      ? await course.destroy() 
      : await course.update( { title, description });
      res
      .status(204)
      .end();
    } else {
      (action === "destroy")
      ? message = 'User is not authorized to delete this course'
      : message = 'You can only update courses you own'
      res
      .status(403)
      .json({ message });
    }
  } else {
    res
    .status(404)
    .json({ message });
  }
};

module.exports = { asyncHandler, authenticateUser, modifyCourse };