import BookModel from '@/models/book';
import ReviewModel from '@/models/review';
import { addReviewRequestHandler } from '@/types';
import { sendErrorResponse } from '@/utils/helper';
import { RequestHandler } from 'express';
import { Types, isValidObjectId } from 'mongoose';

export const addReview: addReviewRequestHandler = async (
  req,
  res
) => {
  const { bookId, rating, content } = req.body;
  await ReviewModel.findOneAndUpdate(
    { book: bookId, user: req.user.id },
    { content, rating },
    { upsert: true }
  );
  const [result] = await ReviewModel.aggregate<{
    averageRating: number;
  }>([
    {
      $match: {
        book: new Types.ObjectId(bookId),
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  await BookModel.findByIdAndUpdate(bookId, {
    averageRating: result.averageRating,
  });
  review: result.averageRating.toFixed(1);

  res.json({
    message: 'Review actualizada',
  });
};

export const getReview: RequestHandler = async (req, res) => {
  const { bookId } = req.body;

  if (!isValidObjectId(bookId))
    return sendErrorResponse({
      res,
      message: 'Book id no válido',
      status: 422,
    });

  const review = await ReviewModel.findOne({
    book: bookId,
    user: req.user.id,
  });
  if (!review)
    return sendErrorResponse({
      res,
      message: 'Review no encontrada',
      status: 404,
    });

  res.json({
    content: review.content,
    rating: review.rating,
  });
};
