import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentResponse extends Document {
  studentId: string;
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  timestamp: Date;
}

const StudentResponseSchema: Schema = new Schema({
  studentId: { type: String, required: true },
  questionId: { type: String, required: true },
  selectedOption: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.StudentResponse || mongoose.model<IStudentResponse>('StudentResponse', StudentResponseSchema);