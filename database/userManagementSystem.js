const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const dbURI = process.env.DATABASE_URL ;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const dbConnection = mongoose.connection;

module.exports = dbConnection;
