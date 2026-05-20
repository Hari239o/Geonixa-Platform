import mongoose, { Schema, Document } from 'mongoose';

export interface ITypingTopic extends Document {
  topicId: string;
  topicText: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

const TypingTopicSchema: Schema = new Schema({
  topicId: { type: String, required: true, unique: true },
  topicText: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  category: { type: String, required: true },
});

export default mongoose.models.TypingTopic || mongoose.model<ITypingTopic>('TypingTopic', TypingTopicSchema);