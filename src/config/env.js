require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 5055,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edupulse',
  jwtSecret: process.env.JWT_SECRET || 'edupulse_dev_secret_change_me',
  jwtExpiry: process.env.JWT_EXPIRY || '30d',
  nodeEnv: process.env.NODE_ENV || 'development'
};
