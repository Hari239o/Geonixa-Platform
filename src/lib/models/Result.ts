import mongoose, { Schema, Document } from 'mongoose';

export interface IResultAnswer {
  questionId: string;
  selectedAnswer: string;
  correct: boolean;
  marks: number;
}

export interface IResult extends Document {
  userId: string;
  score: number;
  totalMarks: number;
  answers: IResultAnswer[];
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResultAnswerSchema: Schema = new Schema(
  {
    questionId: { type: String, required: true },
    selectedAnswer: { type: String, required: true },
    correct: { type: Boolean, required: true },
    marks: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ResultSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    score: { type: Number, required: true, min: 0 },
    totalMarks: { type: Number, required: true, min: 0 },
    answers: { type: [ResultAnswerSchema], required: true, validate: [(val: IResultAnswer[]) => val.length > 0, 'At least one answer is required'] },
    submittedAt: { type: Date, default: () => new Date(), required: true },
  },
  {
    timestamps: true,
    collection: 'results',
  }
);

export default mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);