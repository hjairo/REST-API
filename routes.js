'use strict';

// Load required dependencies
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, Course } = require('./models');
const { asyncHandler, authenticateUser, modifyCourse } = require('./middleware/helperFunctions');


/* USER ROUTES */

// Route that returns the currently authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;
  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
}));

// Route to create a new user. SequelizeUniqueConstraintError errors are handled in the global error handler
router.post('/users', asyncHandler(async (req, res) => {
    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }
    await User.create(req.body);
    res
      .status(201)
      .location('/')
      .end();
}));


/* COURSE ROUTES */

// All courses route
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        include:[
            {
            model: User,
            attributes: ['firstName', 'lastName', 'emailAddress'],
            },
        ],
    });
    res.json(courses);
}));

// Searched course route
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        include:[
            {
            model:User,
            attributes: ['firstName', 'lastName', 'emailAddress'],
            },
        ],
    });
    if (course) {
        res.json(course);
    } else {
        res
        .status(404)
        .json({
        message: 'Id is not in our database',
        });
    }
}));

// Route to create a new course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.create(req.body);
    res
    .status(201)
    .location(`/courses/${course.id}`)
    .end();
}));

// Route for updating a corresponding identified course. modifyCourse() checks to see if the user making the changes is authorized to do so
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const { id } = req.params;
    await modifyCourse(req, res, id);
}));

// Delete a course route. modifyCourse() checks to see if the user making the changes is authorized to do so
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const { id } = req.params;
    await modifyCourse(req, res, id, "destroy");
}));

module.exports = router;
