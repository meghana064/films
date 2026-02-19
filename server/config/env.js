import dotenv from 'dotenv';

dotenv.config();

const {
  PORT = 5000,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME = 'films_db',
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  TMDB_API_KEY,
} = process.env;

const DATABASE_URL = `mysql://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require`;

export default {
  PORT: Number(PORT),
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DATABASE_URL,
  JWT_SECRET,
  JWT_REFRESH_SECRET: JWT_REFRESH_SECRET || JWT_SECRET,
  TMDB_API_KEY,
};
