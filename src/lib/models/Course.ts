import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  courseId: string;
  courseName: string;
  domainType: 'technical' | 'non-technical';
  examRounds: string[];
  questionAllocation: Record<string, number>;
}

const CourseSchema: Schema = new Schema({
  courseId: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  domainType: { type: String, enum: ['technical', 'non-technical'], required: true },
  examRounds: { type: [String], required: true },
  questionAllocation: { type: Map, of: Number, required: true },
});

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);