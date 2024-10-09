import express from "express";
import {verifyToken} from '../middlewares/jwtmiddleware';
const timerRoute = express.Router();

import { NewTimer, listTimer } from '../controllers/timer.controller';

timerRoute
  .route('/:user_id/submit-reaction-time')
  .post(verifyToken, NewTimer)

timerRoute
  .route('/:user_id/get-reaction-times')
  .get(verifyToken, listTimer)


export default timerRoute;
