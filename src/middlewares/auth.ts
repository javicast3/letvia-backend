import UserModel from '@/models/user';
import { addReviewRequestHandler } from '@/types';
import { formatUserProfile, sendErrorResponse } from '@/utils/helper';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
        name?: string;
        email: string;
        role: 'user' | 'admin';
        avatar?: string;
        signedUp: boolean;
        authorId?: string;
      };
    }
  }
}

export const isAuth: RequestHandler = async (req, res, next) => {
  const authToken = req.cookies.authToken;
  if (!authToken) {
    return sendErrorResponse({
      message: 'Solicitud no autorizada!',
      status: 401,
      res,
    });
  }

  const payload = jwt.verify(authToken, process.env.JWT_SECRET!) as {
    userId: string;
  };

  const user = await UserModel.findById(payload.userId);
  if (!user) {
    return sendErrorResponse({
      message: 'Solicitud no autorizada usuario no encontrado',
      status: 401,
      res,
    });
  }
  req.user = formatUserProfile(user);
  next();
};

export const isRentedByTheUser: addReviewRequestHandler = async (
  req,
  res,
  next
) => {
  const user = await UserModel.findOne({
    _id: req.user.id,
    books: req.body.bookId,
  });
  if (!user)
    return sendErrorResponse({
      res,
      message: 'Usuario no habilitado a agregar una review',
      status: 403,
    });
  next();
};

export const isAdmin: RequestHandler = (req, res, next) => {
  if (req.user.role === 'admin') next();
  else
    sendErrorResponse({
      message:
        'No tiene los permisos para acceder a la funcionalidad',
      res,
      status: 401,
    });
};
