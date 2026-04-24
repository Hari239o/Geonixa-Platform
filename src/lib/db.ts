import fs from 'fs';
import path from 'path';

// Using a local JSON database as a mock for the requested database connection
// so it is ready immediately, as requested ("connect database also do it now").
// Supabase is installed in package.json but requires valid Cloud credentials.

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
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
};

export const getDB = (): DatabaseSchema => {
  initDB();
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

export const saveExamResult = (result: any) => {
  const db = getDB();
  db.examResults.push(result);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
};
