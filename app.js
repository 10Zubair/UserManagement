const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const express = require('express');
const dbConnection = require('./database/userManagementSystem');
const rootDir = require('./utils/path');
const dotenv = require('dotenv');
dotenv.config();
//routes
const userRoutes = require('./routes/userRoutes');
const userApiRoutes = require('./routes/userApiRoutes');

const app = express();
app.set('view engine', 'ejs');
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/css', express.static(path.join(rootDir, 'node_modules', 'bootstrap', 'dist', 'css')));

const port = process.env.PORT
dbConnection.on('open', () => {
  app.listen(port, () => {
    console.log('Connected to port ' + port);
  });
});

app.use(cookieParser('Hithiisme'));
app.use(session({
  secret: 'Hithiisme',
  cookie: { 
    secure: false,
    maxAge: 60000
  },
  resave: false,
  saveUninitialized: false,
}));

app.use(flash());
app.use(userApiRoutes);
app.use(userRoutes);

app.use((req, res, next) => {
  res.status(404).send('404');
});
