const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.warn('⚠️ [DB] No MONGO_URI provided in environment. Initializing Memory Server fallback...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      process.env.IS_MEMORY_DB = 'true'; // Flag for auto-seeding
    }

    console.log('📡 [DB] Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ [DB] MongoDB Connected: ${conn.connection.host} (${process.env.IS_MEMORY_DB ? 'IN-MEMORY MODE' : 'REMOTE MODE'})`);
  } catch (error) {
    console.error(`❌ [DB] FATAL: Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
