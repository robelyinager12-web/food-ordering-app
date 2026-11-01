const app = require('./app');
const pool = require('./config/db');
const { port } = require('./config/env');

pool
  .query('SELECT NOW()')
  .then(() => {
    console.log('Database connected');
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
