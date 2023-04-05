const express = require('express');
const userController = require('../controllers/userController');

const userRouter = express.Router();

userRouter.get('/', userController.rootPage);
userRouter.get('/users', userController.rootPage);
userRouter.get('/users/signup', userController.signupPage);
userRouter.post('/users/signup', userController.signupPostFunction);
userRouter.get('/users/login', userController.loginPage);
userRouter.post('/users/login', userController.loginPostFunction);
userRouter.get('/user_dashboard', userController.homePage);
userRouter.get('/users/logout', userController.logout);
userRouter.get('/users/:id', userController.show);
userRouter.get('/users/edit/:id', userController.editPage);
userRouter.get('/users/profile/:id', userController.viewProfile);
userRouter.get('/users/delete/:id', userController.deleteUser);

userRouter.post('/users/edit/:id',userController.uploads.single('profileImage'), userController.editProfile);

module.exports = userRouter;