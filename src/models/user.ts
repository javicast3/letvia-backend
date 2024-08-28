import { ObjectId, Schema, model } from 'mongoose';

export interface UserDoc {
  _id: ObjectId;
  email: string;
  role: 'user' | 'admin';
  name: string;
}
const userSchema = new Schema<UserDoc>({
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

const UserModel = model('User', userSchema);

export default UserModel;
