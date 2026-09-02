/**
 * NOVA E-commerce – Entry point
 * Connects to DB, then starts server.
 */

require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'nova-dev-secret')) {
  console.error('FATAL: Set a strong JWT_SECRET in production.');
  process.exit(1);
}

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`NOVA server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
