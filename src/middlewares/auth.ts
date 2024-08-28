import { sendErrorResponse } from '@/utils/helper';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export const isAuth: RequestHandler = (req, res, next) => {
  const authToken = req.cookies.authToken;
  if (!authToken) {
    return sendErrorResponse({
      message: 'No está autorizado!',
      status: 401,
      res,
    });
  }

  const payload = jwt.verify(authToken, process.env.JWT_SECRET!) as {
    userId: string;
  };
  console.log(payload);
  res.send();
};
