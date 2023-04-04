var csv = require('csvtojson');
const userModel = require('../models/User');

const importUser = async(req, res) => {
  try {
    var userArray = [];
    res.send({status: 200, success: true, msg: 'Imported' })
    const response = await csv().fromFile(req.file.path);//es k pass filee ka path
    for (const user of response) {
      const existingUser = await userModel.findOne({ email: user.email });
      if (!existingUser) {
        userArray.push({
          name: user.name,
          email: user.email,
          password: user.password
        });
      }
    }
    if (userArray.length > 0) {
      await userModel.insertMany(userArray);
    }
  } catch (error) {
    res.send({status: 400, success: false, msg: error.message })
  }
}

module.exports = {
  importUser
}