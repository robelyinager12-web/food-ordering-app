const { Pool } = require('pg');
const { databaseUrl } = require('./env');

const pool = new Pool({ connectionString: databaseUrl });

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = pool;
