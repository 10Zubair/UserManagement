const express = require('express');
const multer = require('multer');
const path = require('path');
const userApiController = require('../controllers/userApiController');
const auth = require('../middleware/auth');

const userApi = express();
userApi.use(express.urlencoded({ extended: true }));

userApi.use(express.static('public'));

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/uploads');
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname)
  },
});

var uploads = multer({ storage: storage });

userApi.post('/importUser', auth, uploads.single('file'), userApiController.importUser )

module.exports = userApi;