const jwt = require('jsonwebtoken');
SECRET_KEY = "jirenGokuGohan";SECRET_KEY = "jirenGokuGohan";

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
