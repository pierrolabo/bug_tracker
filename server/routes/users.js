require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const admin = require('../middleware/permissions/admin');

const User = require('../models/User');
const Project = require('../models/Project');

const { getRoleFromToken } = require('../helpers/AuthHelpers');
const { getOrCreateGeneralProject } = require('../helpers/DbHelpers');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.jwtSecret;

//  @route GET api/users
//  @desc   Get the list of all users || users from project
//  @access private
router.get('/', async (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'Unauthorized' });

  const { role, id } = getRoleFromToken(token);

  /*
   If is admin => all the users
   If we want to restrict project manager by letting admin choose what PG has access
   remove pg from this condition
   If is user => Users from his project
  */
  if (role === 'ADMIN' || role === 'PROJECT_MANAGER') {
    User.find()
      .select('-password')
      .then((user) => res.json(user));
  } else {
    //  Find the project where the user is in
    const projects = await Project.find({ userList: id });
    //  Then find the users from those projects
    let userList = projects
      .map((project) => project.userList)
      .reduce((acc, val) => {
        return [...acc, ...val];
      }, []);
    User.find({ _id: { $in: userList } }).then((users) => res.json(users));
  }
});

//  @route GET api/user:id
//  @desc   Get user by id
//  @access private
router.get('/:id', admin, async (req, res) => {
  const { id } = req.params;
  try {
    //    If ID doesnt match mongoID type
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw 'ID isnt valid';
    }
    User.find({ _id: id })
      .select('-password')
      .then((user) => res.json(user));
  } catch (err) {
    return res.status(400).json({ msg: err });
  }
});

//  @route POST api/users
//  @desc   Register new users
//  @access Public
router.post('/', async (req, res) => {
  const { name, lastname, email, password } = req.body;
  console.log(req.body);
  //  Quick data validations
  if (!name || !lastname || !email || !password) {
    return res.status(400).json({ msg: 'All fields must be complete!' });
  }

  //  Check if email exist in database
  let emailInDatabase = await User.findOne({ email });

  //  Email already in database
  if (emailInDatabase) {
    return res.status(400).json({ msg: 'This email is already registered!' });
  }

  //  User is not in database, we create a new user
  const newUser = new User({
    name,
    lastname,
    email,
    password,
  });

  //  Create salt & hash
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, async (err, hash) => {
      if (err) throw err;
      newUser.password = hash;

      newUser.save().then(async (user) => {
        //By default, new users are assigned to the general project
        const generalProject = await getOrCreateGeneralProject();
        let query = { _id: generalProject.id };
        let update = { $push: { userList: user._id.toString() } };
        let options = { new: true, upsert: true, useFindAndModify: false };
        await Project.findOneAndUpdate(query, update, options);

        //Sign the token
        jwt.sign(
          //  set the role in the token payload
          {
            id: user.id,
            role: user.role,
          },
          JWT_SECRET,
          { expiresIn: 3600 },
          (err, token) => {
            if (err) throw err;

            //  Send the token back
            res.json({
              token,
              user: {
                _id: user.id,
                role: user.role,
                name: user.name,
                lastname: user.lastname,
                email: user.email,
              },
            });
          }
        );
      });
    });
  });
});

//  @route PUT api/users
//  @desc   Update a user by id
//  @access private
router.put('/', async (req, res) => {
  const {
    name,
    lastname,
    address,
    city,
    zip,
    state,
    email,
    role,
    id,
    orgs,
    nextProjects,
  } = req.body;
  if (!name || !lastname || !email || !role || !id) {
    return res.status(400).json({ msg: 'All fields must be complete!' });
  }
  //  Update the user
  let query = { _id: id };
  let update = {
    $set: {
      name: name,
      lastname: lastname,
      email: email,
      address: address,
      city: city,
      zip: zip,
      state: state,
      role: role,
      orgs: orgs,
    },
  };

  //  Delete user from all projects then add user to the selected projects
  //  This is absolutely dumb but i have no time to refecator
  let optionsRemoveMany = { $pull: { userList: id } };
  try {
    await Project.updateMany({}, optionsRemoveMany);
  } catch (err) {
    console.log(err);
  }
  try {
    let query = { _id: { $in: nextProjects } };
    let update = {
      $push: { userList: id },
    };
    await Project.updateMany(query, update);
  } catch (err) {
    console.log(err);
  }

  let options = { new: true, upsert: true, useFindAndModify: false };
  try {
    let updatedUser = await User.findOneAndUpdate(query, update, options);
    return res.json(updatedUser);
  } catch (err) {
    return res.status(400).json({ msg: 'Error updating user' });
  }
});
module.exports = router;
