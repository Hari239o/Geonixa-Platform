import mongoose from 'mongoose';

// Defer MongoDB connection until explicitly requested by calling
// `connectToDatabase()`. This avoids attempting a connection during
// server startup (which may fail in environments without DB access).
const MONGODB_URI = process.env.MONGODB_URI;

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any)._mongoClientPromise || { conn: null, promise: null };

export default async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  if (cached.conn) {
    return cached.conn as typeof mongoose;
  }

  if (!cached.promise) {
    const opts = {
      // Recommended options for modern mongoose
      bufferCommands: false,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 20,
      minPoolSize: 5,
      autoIndex: false,
      family: 4,
    } as mongoose.ConnectOptions;

    mongoose.set('strictQuery', true);

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
    (global as any)._mongoClientPromise = cached;
  }

  const conn = await cached.promise;
  cached.conn = conn as typeof mongoose;
  return cached.conn as typeof mongoose;
}
