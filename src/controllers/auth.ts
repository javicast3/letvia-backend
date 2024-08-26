import { RequestHandler } from 'express';
import crypto from 'crypto';
import VerificationTokenModel from '@/models/verificationToken';
import UserModel from '@/models/user';
import nodemailer from 'nodemailer';
import mail from '@/utils/mail';

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
