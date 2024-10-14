import { addReview, getReview } from '@/controllers/review';
import { isAuth, isRentedByTheUser } from '@/middlewares/auth';
import { newReviewSchema, validate } from '@/middlewares/validator';
import { Router } from 'express';

const reviewRouter = Router();

reviewRouter.post(
  '/',
  isAuth,
  validate(newReviewSchema),
  isRentedByTheUser,
  addReview
);

reviewRouter.get('/:bookId', isAuth, getReview);

export default reviewRouter;
