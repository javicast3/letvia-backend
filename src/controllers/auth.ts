import { RequestHandler } from 'express';
import crypto from 'crypto';

export const generateAuthLink: RequestHandler = (req, res) => {
  const randomToken = crypto.randomBytes(36).toString('hex');
  console.log(req.body);
  //generate authentication link
  res.json({ ok: true });
};
