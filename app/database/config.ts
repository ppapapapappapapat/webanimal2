import { Pool, PoolConfig } from 'pg';

// Database configuration
const config: PoolConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'animalcare',
  password: process.env.DB_PASSWORD || 'your_password',
  port: parseInt(process.env.DB_PORT || '5432'),
};

const pool = new Pool(config);

export default pool; 