import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  studentId: string;
  name: string;
  domain: string;
  courseId: string;
  examProgress: Record<string, any>;
  results: Record<string, any>;
}

const StudentSchema: Schema = new Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  domain: { type: String, required: true },
  courseId: { type: String, required: true },
  examProgress: { type: Map, of: Schema.Types.Mixed, default: {} },
  results: { type: Map, of: Schema.Types.Mixed, default: {} },
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);