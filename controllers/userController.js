const flash = require('connect-flash');
const express = require('express');
const bcrypt = require('bcrypt');
var session = require('express-session');
const userModel = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();
SECRET_KEY = process.env.SECRET_KEY;

const app = express();
app.use(flash());

const rootPage = (req, res) => {
  res.render('root');
};

const signupPage = (req, res) => {
  res.render('signupForm');
};

const signupPostFunction =  async(req, res) => {
  try {
    var salt = await bcrypt.genSalt(10);

    const password = await bcrypt.hash(req.body.password, salt);
    const name = req.body.name;
    const email = req.body.email;

    const newUser = new userModel({ name, email, password });
    await newUser.save()
      .then(() => {
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/users/login');
      });
  } catch (error) {
    console.log(error.message);
  }
};

const loginPage = (req, res) => {
  res.render('loginForm', { message: req.flash('success_msg'), error_msg: req.flash('error_msg') });
};

const loginPostFunction = async(req, res) => {
  try {
    const findUser = await userModel.findOne({ email: req.body.email });
    if (!findUser) {
      req.flash('error_msg', 'No user found with that email');
      res.redirect('/users/login');
    }
    else {
      const validPassword = await bcrypt.compare(req.body.password, findUser.password);
      if (!validPassword) {
        console.log('Password invalid'); 
        req.flash('error_msg', 'Incorrect password');
        res.redirect('/users/login');
      }
      else {
        session = req.session;
        session.email = findUser.email;
        session.userId = findUser._id
        const payload = {
          email: findUser.email,
          id: findUser._id
        };
        if ( findUser.isAdmin) {
          const token = jwt.sign(payload, SECRET_KEY);
          await userModel.findByIdAndUpdate(findUser._id, { token: token });
        }
        //console.log(findUser);
        req.flash('loggin_msg', 'You are now logged in');
        res.redirect('/user_dashboard');
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const homePage = async(req, res) => {
  if (req.session.email) {
    const findUser = await userModel.findOne({ email: req.session.email });
    try {
      var searchQuery = ''; 
      if (req.query.search) {
        searchQuery = req.query.search;
      }
      var page = 1;

      if (req.query.page) {
        page = req.query.page;
      }
      const limit = 10;
      const nonAdminUsers = await userModel.find({ 
        isAdmin: false,
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
          { mobileNum: { $regex: searchQuery, $options: 'i' } },
          { cnic: { $regex: searchQuery, $options: 'i' } },
          
        ] 
       })
       .limit(limit * 1)
       .skip((page - 1) * limit)
       .exec();

       const count = await userModel.find({ 
        isAdmin: false,
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
          { mobileNum: { $regex: searchQuery, $options: 'i' } },
          { cnic: { $regex: searchQuery, $options: 'i' } },
          
        ] 
       })
       .countDocuments();

      findUser.isAdmin ? res.render('admin_dashboard', { nonAdminUsers: nonAdminUsers, totalPages: Math.ceil(count/limit), currentPage: page, login_msg: req.flash('loggin_msg') }) : res.render('user_dashboard', { user: findUser, login_msg: req.flash('loggin_msg')});
    } catch (error) {
      console.log(error.message);
    }
  } else {
    res.redirect('/users/login');
  }  
};

const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.log(error.message);
    }
    else {
      res.redirect('/users/login');
    }
  });
};

const show = async (req, res) => {
  if (req.session.email) {
    try {
      const findUser = await userModel.findById({ _id: req.session.userId});
      if (findUser._id != req.params.id){
        req.flash('error_msg', 'You are not authorized to access this page');
         return res.redirect('/users/login');
      } 
      res.render('show', { user: findUser });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.redirect('/users/login');
  }
};

const editPage = async (req, res) => {
  if (req.session.email) {
    const findUser = await userModel.findById({ _id: req.session.userId});
    if (findUser._id != req.params.id){
      req.flash('error_msg', 'You are not authorized to access this page');
       return res.redirect('/users/login');
    } 
    res.render('editForm');
  }
  else {
    res.redirect('/users/login');
  }
};

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/uploads');
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname)
  },
});

var uploads = multer({ storage: storage });

const editProfile = async (req, res) => {
  if (req.session.email) {
    try {
      console.log('visited');
      await userModel.findByIdAndUpdate({ _id: req.session.userId }, { cnic: req.body.cnic, mobileNum: req.body.mobileNum });
      if (req.file) {
        console.log('hai file');
        const imagePath = '/uploads/' + req.file.filename;
        const findUser = await userModel.findByIdAndUpdate({ _id: req.session.userId }, { profileImage: imagePath });
        res.render('show', {user: findUser});
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Error occurred while updating user profile.");
    }
  } else {
    res.redirect('/users/login');
  }
};

const viewProfile = async(req, res) => {
  if (req.session.email) {
    try {
      const findUser = await userModel.findByIdAndUpdate({ _id: req.params.id });
      res.render('show', { user: findUser });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.redirect('/users/login');
  }
};

const deleteUser = async(req, res) => {
  if (req.session.email) {
    try {
      await userModel.findByIdAndDelete({ _id: req.params.id });
      res.redirect('/user_dashboard');
    } catch (error) {
      console.log(error);
    }
  } else {
    
  }
};

module.exports = {
  rootPage,
  signupPage,
  signupPostFunction,
  loginPage,
  loginPostFunction,
  homePage,
  logout,
  editPage,
  editProfile,
  show,
  uploads,
  viewProfile,
  deleteUser
}