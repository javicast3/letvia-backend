import { Schema, model } from 'mongoose';

const verificationTokenSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    default: Date.now(),
    //24 horas en milisegundo
    expires: 60 * 60 * 24,
  },
});
const verificationTokenModel = model(
  'VerificationToken',
  verificationTokenSchema
);
export default verificationTokenModel;
