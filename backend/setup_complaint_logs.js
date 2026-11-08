import pool from './src/config/database.js';

async function setup() {
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Add handled_by and handled_at to complaints if they don't exist
    // MySQL does not have "ADD COLUMN IF NOT EXISTS" elegantly, so we catch errors
    try {
      await connection.execute(`
        ALTER TABLE complaints 
        ADD COLUMN handled_by VARCHAR(100) NULL AFTER admin_note,
        ADD COLUMN handled_at TIMESTAMP NULL AFTER handled_by
      `);
      console.log('Added handled_by and handled_at to complaints table.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Columns handled_by and handled_at already exist in complaints table.');
      } else {
        throw err;
      }
    }

    // 2. Create complaint_logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS complaint_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        admin_note TEXT NULL,
        handled_by VARCHAR(100) NULL,
        handled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
      );
    `);
    console.log('Table complaint_logs created or already exists.');

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error during database setup:', error);
    if (connection) connection.release();
    process.exit(1);
  }
}

setup();
