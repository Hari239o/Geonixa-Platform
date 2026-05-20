import mongoose, { Schema, Document } from 'mongoose';

export interface IGrammarQuestion extends Document {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  category: string;
}

const GrammarQuestionSchema: Schema = new Schema({
  questionId: { type: String, required: true, unique: true },
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'very-hard'], required: true },
  category: { type: String, required: true },
});

export default mongoose.models.GrammarQuestion || mongoose.model<IGrammarQuestion>('GrammarQuestion', GrammarQuestionSchema);