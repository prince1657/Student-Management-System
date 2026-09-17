const mongoose = require('mongoose');
const { mongoUri } = require('./env');

// The frontend falls back to its local store when /api/health reports
// database: "offline", so a failed connection must not kill the process.
async function connectDatabase() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`  db     connected  ${mongoose.connection.name}`);
    return true;
  } catch (err) {
    console.warn(`  db     unavailable  ${err.message}`);
    console.warn('         serving the UI in offline mode (browser-local data)');
    return false;
  }
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDatabase, isDatabaseReady };
