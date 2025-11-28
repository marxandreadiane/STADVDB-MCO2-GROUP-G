import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.DB_REPORTS_HOST || 'postgres',
  port: process.env.DB_REPORTS_PORT || 5432,
  user: process.env.DB_REPORTS_USER || 'postgres',
  password: process.env.DB_REPORTS_PASS || 'postgres',
  database: process.env.DB_REPORTS_NAME || 'kpop_store',
});

async function checkAndResetOLAP() {
  const client = await pool.connect();
  try {
    console.log('Checking OLAP structure...');
    
    // Read and execute the check script
    const checkScript = fs.readFileSync(
      path.join(__dirname, 'check-olap-structure.sql'),
      'utf8'
    );
    
    await client.query(checkScript);
    
    // Check if sales_fact exists after the check
    const result = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sales_fact'
      ) as exists
    `);
    
    if (!result.rows[0].exists) {
      console.log('OLAP structure was reset. Recreating OLAP tables...');
      
      // Read and execute the OLAP creation script
      const olapScript = fs.readFileSync(
        path.join(__dirname, 'olap-tables-only.sql'),
        'utf8'
      );
      
      console.log('Creating OLAP tables and functions...');
      await client.query(olapScript);
      
      console.log('OLAP structure recreated successfully.');
    } else {
      console.log('OLAP structure is correct.');
    }
  } catch (err) {
    console.error('Error checking/resetting OLAP structure:', err.message);
    console.error(err.stack);
    // Don't throw - allow service to continue
  } finally {
    client.release();
  }
}

// Run check on startup
checkAndResetOLAP()
  .then(() => {
    console.log('OLAP structure check complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

