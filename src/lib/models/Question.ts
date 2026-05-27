import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  questionId: string;
  question: string;
  questionText?: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  category: string;
  marks: number;
}

const QuestionSchema: Schema = new Schema(
  {
    questionId: { type: String, required: true, unique: true },
    question: { type: String, required: true },
    options: { type: [String], required: true, validate: [(val: string[]) => val.length >= 2, 'At least two options are required'] },
    correctAnswer: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'very-hard'],
      required: true,
    },
    category: { type: String, required: true },
    marks: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Keep backwards compatibility for older code that still expects questionText.
QuestionSchema.virtual('questionText').get(function (this: any) {
  return this.question;
});

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);