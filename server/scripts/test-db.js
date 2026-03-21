require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB production database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to the production database!');
    const admin = mongoose.connection.db.admin();
    const pingInfo = await admin.ping();
    if (pingInfo.ok) {
      console.log('Connected to the Production DB!!');
    } else {
      console.log('Connected to the Production DB, but ping returned unexpected result: ', pingInfo);
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB production database:');
    console.error(error.message);
   
  } finally {
    await mongoose.disconnect();
    console.log('Connection closed. Exiting test.');
    process.exit(0);
  }
}

testConnection();