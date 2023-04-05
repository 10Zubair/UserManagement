const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
SECRET_KEY = process.env.SECRET_KEY;

const userModel = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  console.log(token);
  next();
};

module.exports = auth
