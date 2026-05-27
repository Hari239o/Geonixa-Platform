import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  name?: string;
  role?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    name: { type: String },
    role: { type: String, default: 'student' },
    createdAt: { type: Date, default: () => new Date() }, // Keep the original line for context
  },
  { collection: 'users', timestamps: true }
);

const existingUserModel = mongoose.models.User as Model<IUser> | undefined;
// Reuse existing model if present to avoid OverwriteModelError in hot-reload/dev
const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema, 'users');

export default User;
