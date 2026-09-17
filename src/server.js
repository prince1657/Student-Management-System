const app = require('./app');
const { connectDatabase } = require('./config/database');
const { port, nodeEnv } = require('./config/env');

async function start() {
  console.log('\n  EduPulse — Student Management System');
  await connectDatabase();

  app.listen(port, () => {
    console.log(`  server running   http://localhost:${port}`);
    console.log(`  environment      ${nodeEnv}\n`);
  });
}

start();
