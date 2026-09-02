/**
 * MongoDB connection configuration
 * Retries connection before failing
 */

const mongoose = require('mongoose');
let mongod = null;
let usingInMemory = false;
// mongodb-memory-server is an optional dev-time dependency; require lazily
let MongoMemoryServer;

// Avoid Mongoose 8 strictQuery deprecation warnings
mongoose.set('strictQuery', true);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

const connectDB = async () => {
  if (process.env.SKIP_DB === 'true') {
    console.log('SKIP_DB=true — skipping MongoDB connection (development mode).');
    return;
  }
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nova_ecommerce';
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES}:`, err.message);
      if (attempt === MAX_RETRIES) {
        // If a remote URI was provided and failed, try a local fallback before exiting
        const hasRemote = !!process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('localhost');
        if (hasRemote) {
          console.log('Remote MongoDB connection failed after retries — attempting local MongoDB fallback...');
          try {
            const localConn = await mongoose.connect('mongodb://localhost:27017/nova_ecommerce', { serverSelectionTimeoutMS: 5000 });
            console.log(`MongoDB connected (fallback): ${localConn.connection.host}`);
            return;
          } catch (localErr) {
            console.error('Fallback to local MongoDB failed:', localErr.message);
          }

            if (process.env.NODE_ENV === 'production') {
              console.error('Production database is unavailable; refusing to use an in-memory database.');
              process.exit(1);
            }
        }

        // If local fallback failed, try an in-memory MongoDB (dev only)
        try {
          MongoMemoryServer = MongoMemoryServer || require('mongodb-memory-server').MongoMemoryServer;
        } catch (e) {
          console.error('mongodb-memory-server not installed; cannot start in-memory MongoDB.');
        }

        if (MongoMemoryServer) {
          try {
            console.log('Starting in-memory MongoDB for development...');
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            const memConn = await mongoose.connect(uri);
            usingInMemory = true;
            console.log(`MongoDB connected (in-memory): ${memConn.connection.host}`);
            return;
          } catch (memErr) {
            console.error('In-memory MongoDB failed to start:', memErr.message);
          }
        }

        console.error('Cannot connect to MongoDB. Ensure it is running and MONGODB_URI is correct.');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = connectDB;
