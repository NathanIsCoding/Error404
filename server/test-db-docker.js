require('dotenv').config();
const mongoose = require('mongoose');

async function testDockerConnection() {
  try {
    const uri = 'mongodb://127.0.0.1:27017/error404';
    console.log(`Attempting to connect to Docker MongoDB at ${uri}...`);
    
    await mongoose.connect(uri);
    console.log('Connected to the Docker database');
    
    const admin = mongoose.connection.db.admin();
    const pingInfo = await admin.ping();
    
    if (pingInfo.ok) {
      console.log('Success!');
    } else {
      console.log('Unexpected ping result: ', pingInfo);
    }
  } catch (error) {
    console.error('Failed to connect');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Exiting test.');
    process.exit(0);
  }
}

testDockerConnection();