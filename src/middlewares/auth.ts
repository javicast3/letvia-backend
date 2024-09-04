import UserModel from '@/models/user';
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
