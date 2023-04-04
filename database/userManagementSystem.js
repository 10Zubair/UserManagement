const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost/UserManagement';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const dbConnection = mongoose.connection;

module.exports = dbConnection;
