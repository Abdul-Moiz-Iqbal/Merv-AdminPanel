import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global variable to store connection across hot reloads
declare global {
  var mongoose: MongooseConnection | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<typeof mongoose> {
  // If already connected, return existing connection
  if (cached!.conn) {
    console.log("Connected to DB:", mongoose.connection.name);
    console.log("Using existing Mongoose connection");
    return cached!.conn;
  }

  // If connection promise doesn't exist, create it
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Connection pool size
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log("Creating new Mongoose connection...");
    cached!.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached!.conn = await cached!.promise;
    console.log("MongoDB connected successfully");
  } catch (e) {
    cached!.promise = null;
    console.error("MongoDB connection error:", e);
    throw e;
  }

  return cached!.conn;
}

export default connectDB;