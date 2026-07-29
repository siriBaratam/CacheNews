import mongoose from 'mongoose';
import dns from 'dns';

// Fix: Windows DNS Client refuses TCP SRV lookups. Use Google DNS instead.
dns.setServers(['8.8.8.8', '1.1.1.1']);


export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cache-news';
    const conn = await mongoose.connect(connStr, { family: 4 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
