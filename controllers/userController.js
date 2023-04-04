const bcrypt = require('bcrypt');
 var session = require('express-session');
const userModel = require('../models/User');
const jwt = require('jsonwebtoken');
SECRET_KEY = "jirenGokuGohan"; 

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
        res.redirect('/users/login');
      });
  } catch (error) {
    console.log(error.message);
  }
};

const loginPage = (req, res) => {
  res.render('loginForm');
};

const loginPostFunction = async(req, res) => {
  try {
    const findUser = await userModel.findOne({ email: req.body.email });
    if (!findUser) {
      res.redirect('/users/login');
    }
    else {
      const validPassword = await bcrypt.compare(req.body.password, findUser.password);
      if (!validPassword) {
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
        const token = jwt.sign(payload, SECRET_KEY);
        await userModel.findByIdAndUpdate(findUser._id, { token: token });
        console.log(findUser);
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
      const nonAdminUsers = await userModel.find({ isAdmin: false });
      findUser.isAdmin ? res.render('admin_dashboard', { nonAdminUsers: nonAdminUsers }) : res.render('user_dashboard');
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

module.exports = {
  rootPage,
  signupPage,
  signupPostFunction,
  loginPage,
  loginPostFunction,
  homePage,
  logout,
}