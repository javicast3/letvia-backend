import { ObjectId, Schema, model } from 'mongoose';

export interface UserDoc {
  _id: ObjectId;
  email: string;
  role: 'user' | 'admin';
  name?: string;
  signedUp: boolean;
  avatar?: { url: string; id: string };
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
  signedUp: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: Object,
    url: String,
    id: String,
  },
});

const UserModel = model('User', userSchema);

export default UserModel;
