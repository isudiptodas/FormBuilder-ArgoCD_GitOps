import mongoose from 'mongoose';

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.NODE_ENV === 'test'
    ? process.env.MONGO_TEST_URI
    : process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MongoDB connection string is missing');
  }

  await mongoose.connect(uri);
  return mongoose.connection;
};

