require('dotenv').config();

const port = process.env.PORT || 5000;

module.exports = {
  port,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  chapaSecretKey: process.env.CHAPA_SECRET_KEY,
  publicUrl: (process.env.PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, ''),
};
