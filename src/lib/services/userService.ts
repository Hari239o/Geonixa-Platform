import {
  getFirestoreDb,
  createDocument,
  getDocuments,
  getDocument,
  setDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/firestore';

export interface IUser {
  id?: string;
  email: string;
  passwordHash?: string;
  name?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const COLLECTION = 'users';

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<IUser | null> {
  const users = await getDocuments<IUser>(COLLECTION, ['email', '==', email]);
  return users.length > 0 ? users[0] : null;
}

/**
 * Find user by ID
 */
export async function findUserById(userId: string): Promise<IUser | null> {
  return getDocument<IUser>(COLLECTION, userId);
}

/**
 * Create a new user
 */
export async function createUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
  const userId = await createDocument<Omit<IUser, 'id'>>(COLLECTION, {
    email: userData.email,
    passwordHash: userData.passwordHash,
    name: userData.name,
    role: userData.role || 'student',
  });

  const user = await findUserById(userId);
  if (!user) throw new Error('Failed to create user');
  
  return { id: userId, ...user };
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  updates: Partial<IUser>
): Promise<void> {
  const { id, createdAt, updatedAt, ...data } = updates;
  await updateDocument(COLLECTION, userId, data);
}

/**
 * Get all users (for admin purposes)
 */
export async function getAllUsers(): Promise<IUser[]> {
  return getDocuments<IUser>(COLLECTION);
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  return user !== null;
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  await deleteDocument(COLLECTION, userId);
}
