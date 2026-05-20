import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentTypingResponse extends Document {
  studentId: string;
  topicId: string;
  typedText: string;
  typingSpeed: number;
  accuracy: number;
  mistakes: number;
  backspaceCount: number;
  timestamp: Date;
}

const StudentTypingResponseSchema: Schema = new Schema({
  studentId: { type: String, required: true },
  topicId: { type: String, required: true },
  typedText: { type: String, required: true },
  typingSpeed: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  mistakes: { type: Number, required: true },
  backspaceCount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.StudentTypingResponse || mongoose.model<IStudentTypingResponse>('StudentTypingResponse', StudentTypingResponseSchema);