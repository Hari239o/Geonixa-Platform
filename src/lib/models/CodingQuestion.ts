import mongoose, { Schema, Document } from 'mongoose';

export interface ICodingQuestion extends Document {
  questionId: string;
  questionText: string;
  sampleTestCases: { input: string; output: string }[];
  hiddenTestCases: { input: string; output: string }[];
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
}

const CodingQuestionSchema: Schema = new Schema({
  questionId: { type: String, required: true, unique: true },
  questionText: { type: String, required: true },
  sampleTestCases: { type: [{ input: String, output: String }], required: true },
  hiddenTestCases: { type: [{ input: String, output: String }], required: true },
  language: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  domain: { type: String, required: true },
});

export default mongoose.models.CodingQuestion || mongoose.model<ICodingQuestion>('CodingQuestion', CodingQuestionSchema);