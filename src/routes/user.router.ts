import express from "express";
import {verifyToken, verifyUserToken} from '../middlewares/jwtmiddleware';
import {userRegister, userLogin, userDelete, userPut} from '../controllers/user.controller'
const userRoute = express.Router();


// /users/register
userRoute
    .route('/register')
    .post(userRegister)

// /users/login
userRoute
    .route('/login')
    .post(userLogin)

// /users/:user_id
userRoute
    .route('/:user_id')
    .delete(verifyToken, verifyUserToken, userDelete)
    .put(verifyToken, verifyUserToken, userPut)
export default userRoute;
