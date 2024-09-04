import 'express-async-errors';
import '@/db/connect';
import express from 'express';
import authRouter from './routes/auth';
import { errorHandler } from './middlewares/error';
import cookieParser from 'cookie-parser';
import { fileParser } from './middlewares/file';

const app = express();
const port = process.env.PORT || 8989;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/auth', authRouter);
app.post('/test', fileParser, (req, res) => {
  console.log(req.files);
  console.log(req.body);

  res.json({});
});
app.use(errorHandler);

app.listen(port, () => {
  console.log(`the application is running in port ${port}`);
});
