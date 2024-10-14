import 'express-async-errors';
import '@/db/connect';
import express from 'express';
import authRouter from './routes/auth';
import { errorHandler } from './middlewares/error';
import cookieParser from 'cookie-parser';
import { fileParser } from './middlewares/file';
import authorRouter from './routes/author';
import bookRouter from './routes/book';
import reviewRouter from './routes/review';
import ReviewModel from './models/review';
import { Types } from 'mongoose';

const app = express();
const port = process.env.PORT || 8989;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/author', authorRouter);
app.use('/book', bookRouter);
app.use('/review', reviewRouter);
app.get('/test', async (req, res) => {
  const [result] = await ReviewModel.aggregate<{
    averageRating: number;
  }>([
    {
      $match: {
        book: new Types.ObjectId('66faf3fa533d38939b9b5caa'),
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  res.json({ review: result.averageRating.toFixed(1) });
});
app.use(errorHandler);

app.listen(port, () => {
  console.log(`the application is running in port ${port}`);
});
