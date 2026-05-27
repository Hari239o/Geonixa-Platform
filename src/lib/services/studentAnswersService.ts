import {
  getFirestoreDb,
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  cleanupOldStudentAnswers as cleanupOldStudentAnswersFromFirestore,
} from '@/lib/firestore';

export interface StudentAnswer {
  id?: string;
  studentId: string;
  examId: string;
  questionId: string;
  answer: any;
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTION = 'studentAnswers';

/**
 * Save student answer
 */
export async function saveStudentAnswer(answer: Omit<StudentAnswer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const answerId = await createDocument<Omit<StudentAnswer, 'id'>>(COLLECTION, {
    ...answer,
    submittedAt: new Date(),
  });
  return answerId;
}

/**
 * Get student's answers for an exam
 */
export async function getStudentExamAnswers(
  studentId: string,
  examId: string
): Promise<StudentAnswer[]> {
  const db = getFirestoreDb();
  const snapshot = await db
    .collection(COLLECTION)
    .where('studentId', '==', studentId)
    .where('examId', '==', examId)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as StudentAnswer));
}

/**
 * Get specific student answer
 */
export async function getStudentAnswer(answerId: string): Promise<StudentAnswer | null> {
  return getDocument<StudentAnswer>(COLLECTION, answerId);
}

/**
 * Update student answer
 */
export async function updateStudentAnswer(
  answerId: string,
  updates: Partial<StudentAnswer>
): Promise<void> {
  const { id, createdAt, ...data } = updates;
  await updateDocument(COLLECTION, answerId, data);
}

/**
 * Delete student answer
 */
export async function deleteStudentAnswer(answerId: string): Promise<void> {
  await deleteDocument(COLLECTION, answerId);
}

/**
 * Get all answers for a question (for analytics)
 */
export async function getQuestionAnswers(questionId: string): Promise<StudentAnswer[]> {
  return getDocuments<StudentAnswer>(COLLECTION, ['questionId', '==', questionId]);
}

/**
 * Get all answers for a student
 */
export async function getStudentAllAnswers(studentId: string): Promise<StudentAnswer[]> {
  return getDocuments<StudentAnswer>(COLLECTION, ['studentId', '==', studentId]);
}

/**
 * Clean up answers older than 48 hours
 * Call this periodically via a cron job or Cloud Function
 */
export async function cleanupOldStudentAnswers(): Promise<number> {
  return cleanupOldStudentAnswersFromFirestore(48); // 48 hours = 2 days
}

/**
 * Get unanswered questions for a student in an exam
 */
export async function getUnansweredQuestions(
  studentId: string,
  examId: string,
  totalQuestions: number
): Promise<number[]> {
  const answers = await getStudentExamAnswers(studentId, examId);
  const answeredIds = answers.map((a) => parseInt(a.questionId));
  
  const unanswered: number[] = [];
  for (let i = 0; i < totalQuestions; i++) {
    if (!answeredIds.includes(i)) {
      unanswered.push(i);
    }
  }
  
  return unanswered;
}
