import { RequestHandler } from 'express';
import crypto from 'crypto';
import VerificationTokenModel from '@/models/verificationToken';
import UserModel from '@/models/user';
import nodemailer from 'nodemailer';
import mail from '@/utils/mail';
import { formatUserProfile, sendErrorResponse } from '@/utils/helper';
import jwt from 'jsonwebtoken';

export const generateAuthLink: RequestHandler = async (req, res) => {
  const { email } = req.body;
  let user = await UserModel.findOne({ email: email });
  if (!user) {
    user = await UserModel.create({ email });
  }
  const userId = user._id.toString();

  //Si ya tenemos token para el user primero lo eliminamos
  await VerificationTokenModel.findOneAndDelete({
    userId: userId,
  });
  const randomToken = crypto.randomBytes(36).toString('hex');

  await VerificationTokenModel.create<{ userId: string }>({
    userId: userId,
    token: randomToken,
  });

  const link = `${process.env.VERIFICATION_LINK}?token=${randomToken}&userId=${userId}`;

  await mail.sendVerificationMail({
    link,
    to: user.email,
  });

  res.json({
    message:
      'Por favor, chequea tu email para loguearte en tu cuenta',
  });
};

export const verifyAuthToken: RequestHandler = async (req, res) => {
  const { token, userId } = req.query;
  if (typeof token !== 'string' || typeof userId !== 'string') {
    return sendErrorResponse({
      status: 403,
      message: 'Request Inválido',
      res,
    });
  }
  const verificationToken = await VerificationTokenModel.findOne({
    userId,
  });
  if (!verificationToken || !verificationToken.compare(token)) {
    return sendErrorResponse({
      status: 403,
      message: 'Request Inválido',
      res,
    });
  }
  const user = await UserModel.findById(userId);
  if (!user) {
    return sendErrorResponse({
      status: 500,
      message: 'Hubo un Error, usuario no encontrado',
      res,
    });
  }
  await VerificationTokenModel.findByIdAndDelete(
    verificationToken._id
  );

  const payload = { userId: user._id };
  const authToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '15d',
  });
  res.cookie('authToken', authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), //expira despues de 15 dias
  });
  // res.redirect(
  //   `${process.env.AUTH_SUCCESS_URL}?profile${JSON.stringify(
  //     formatUserProfile(user)
  //   )}`
  // );
  res.send();
};

export const sendProfileInfo: RequestHandler = (req, res) => {};
