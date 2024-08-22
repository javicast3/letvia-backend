import { RequestHandler } from 'express';

export const generateAuthLink: RequestHandler = (req, res) => {
  console.log(req.body);
  //generate authentication link
  res.json({ ok: true });
};
