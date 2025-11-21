import mysql from 'mysql2/promise';

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'webanimal',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Type definitions
interface Sighting {
  id: number;
  species: string;
  confidence: number;
  condition: string;
  image_path: string;
  created_at: Date;
  user_id?: number;
}

interface Report {
  id: number;
  sighting_id: number;
  title: string;
  status: string;
  admin_notes?: string;
  created_at: Date;
  updated_at?: Date;
}

interface UserSighting extends Sighting {
  report_id?: number;
  title?: string;
  status?: string;
  admin_notes?: string;
  report_created?: Date;
  updated_at?: Date;
}

interface SightingDetail extends Sighting {
  report_id?: number;
  title?: string;
  status?: string;
  admin_notes?: string;
  report_created?: Date;
  updated_at?: Date;
  user_name?: string;
  user_email?: string;
}

// Generic query function
export async function queryDB(sql: string, params: any[] = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    return results as any[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to execute database query.');
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Get all sightings with their reports for a specific user
export async function getUserSightings(userId: string): Promise<UserSighting[]> {
  const sqlQuery = `
    SELECT 
      s.id, 
      s.species, 
      s.confidence, 
      s.condition,
      s.image_path,
      s.created_at,
      r.id as report_id,
      r.title,
      r.status,
      r.admin_notes,
      r.created_at as report_created,
      r.updated_at
    FROM sighting s
    LEFT JOIN report r ON s.id = r.sighting_id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `;
  const results = await queryDB(sqlQuery, [userId]);
  return results as UserSighting[];
}

// Get detailed sighting information
export async function getSightingDetail(sightingId: string, userId: string): Promise<SightingDetail | null> {
  const sqlQuery = `
    SELECT 
      s.*,
      r.id as report_id,
      r.title,
      r.status,
      r.admin_notes,
      r.created_at as report_created,
      r.updated_at,
      u.name as user_name,
      u.email as user_email
    FROM sighting s
    LEFT JOIN report r ON s.id = r.sighting_id
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.user_id = ?
  `;
  const results = await queryDB(sqlQuery, [sightingId, userId]);
  return results.length > 0 ? (results[0] as SightingDetail) : null;
}

// Get updates for a specific report
export async function getReportUpdates(reportId: string): Promise<any[]> {
  const sqlQuery = `
    SELECT * FROM report_updates 
    WHERE report_id = ?
    ORDER BY created_at DESC
  `;
  return await queryDB(sqlQuery, [reportId]);
}

// Get all reports for admin view
export async function getAdminReports(): Promise<UserSighting[]> {
  const sqlQuery = `
    SELECT 
      s.id, 
      s.species, 
      s.confidence, 
      s.condition,
      s.image_path,
      s.created_at,
      r.id as report_id,
      r.title,
      r.status,
      r.admin_notes,
      r.created_at as report_created,
      r.updated_at,
      u.name as user_name,
      u.email as user_email
    FROM sighting s
    LEFT JOIN report r ON s.id = r.sighting_id
    LEFT JOIN users u ON s.user_id = u.id
    ORDER BY s.created_at DESC
    LIMIT 100
  `;
  const results = await queryDB(sqlQuery);
  return results as UserSighting[];
}

// Update report status (admin function)
export async function updateReportStatus(reportId: string, status: string, adminNotes?: string) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Update report status
    const updateQuery = `
      UPDATE report 
      SET status = ?, 
          admin_notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await connection.execute(updateQuery, [status, adminNotes, reportId]);

    // Try to add to report_updates table (if it exists)
    try {
      const insertQuery = `
        INSERT INTO report_updates (report_id, title, description, author, created_at)
        VALUES (?, 'Status Updated', ?, 'Admin', CURRENT_TIMESTAMP)
      `;
      await connection.execute(insertQuery, [
        reportId, 
        `Report status changed to ${status}. ${adminNotes ? 'Notes: ' + adminNotes : ''}`
      ]);
    } catch (error) {
      // If report_updates table doesn't exist, just continue
      console.log('report_updates table might not exist, continuing without it...');
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error('Database Error:', error);
    return { success: false, error: 'Failed to update report' };
  } finally {
    connection.release();
  }
}

// Close pool (optional - for cleanup)
export async function closePool() {
  await pool.end();
}