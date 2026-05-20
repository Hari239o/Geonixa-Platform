// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mongoose: any;
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/geonixa_exam";

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = (async () => {
      try {
        if (!mongoose) {
          // Dynamic import so the build doesn't fail if mongoose isn't installed yet
          mongoose = (await import('mongoose')).default;
        }
        const conn = await mongoose.connect(MONGODB_URI, { bufferCommands: false });
        return conn;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('MongoDB connection notice (using local fallback):', msg);
        return null;
      }
    })();
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;

// Local JSON Database Helper for mock testing & rapid evaluation
const DB_PATH = path.join(process.cwd(), 'database.json');

interface User {
  id: string;
  role: 'student' | 'admin';
  email: string;
}

interface DatabaseSchema {
  users: User[];
  examResults: any[];
}

export const initDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    const initialData: DatabaseSchema = {
      users: [
        { id: "admin-1", role: "admin", email: "admin@geonixa.com" }
      ],
      examResults: []
    };
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch (e) {
      // Ignore if write protected in serverless environment
    }
  }
};

export const getDB = (): DatabaseSchema => {
  initDB();
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    // Fallback
  }
  return { users: [{ id: "admin-1", role: "admin", email: "admin@geonixa.com" }], examResults: [] };
};

export const saveExamResult = (result: any) => {
  const db = getDB();
  db.examResults.push(result);
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    // Ignore in serverless
  }
};
