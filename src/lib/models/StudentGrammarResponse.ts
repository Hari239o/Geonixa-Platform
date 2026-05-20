import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentGrammarResponse extends Document {
  studentId: string;
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  timestamp: Date;
}

const StudentGrammarResponseSchema: Schema = new Schema({
  studentId: { type: String, required: true },
  questionId: { type: String, required: true },
  selectedOption: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.StudentGrammarResponse || mongoose.model<IStudentGrammarResponse>('StudentGrammarResponse', StudentGrammarResponseSchema);