import {
  createNewBook,
  getAllPurchasedBooks,
  updateBook,
} from '@/controllers/book';
import { isAuth, isAdmin } from '@/middlewares/auth';
import { fileParser } from '@/middlewares/file';
import {
  newBookSchema,
  updateBookSchema,
  validate,
} from '@/middlewares/validator';

import { Router } from 'express';

const bookRouter = Router();

bookRouter.post(
  '/create',
  isAuth,
  isAdmin,
  fileParser,
  validate(newBookSchema),
  createNewBook
);

bookRouter.patch(
  '/',
  isAuth,
  isAdmin,
  fileParser,
  validate(updateBookSchema),
  updateBook
);
bookRouter.get('/list', isAuth, getAllPurchasedBooks);

export default bookRouter;
