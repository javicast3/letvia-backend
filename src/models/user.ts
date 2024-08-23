import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
});

const userModel = model('User', userSchema);

export default userModel;
