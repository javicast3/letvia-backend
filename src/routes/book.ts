import { createNewBook } from '@/controllers/book';
import { isAuth, isAdmin } from '@/middlewares/auth';
import { fileParser } from '@/middlewares/file';
import { newBookSchema, validate } from '@/middlewares/validator';

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

export default bookRouter;
