import pool from './config';
import { QueryResult } from 'pg';

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    created_at: Date;
    updated_at: Date;
}

export interface ActivityLog {
    id: number;
    user_id: number;
    action: string;
    target: string;
    details: any;
    created_at: Date;
}

export const dbUtils = {
    // User operations
    async createUser(username: string, email: string, passwordHash: string, role: string = 'user'): Promise<User> {
        const query = `
            INSERT INTO users (username, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [username, email, passwordHash, role]);
        return result.rows[0];
    },

    async getUsers(): Promise<User[]> {
        const query = 'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC';
        const result = await pool.query(query);
        return result.rows;
    },

    // Activity Log operations
    async createActivityLog(userId: number, action: string, target: string, details: any = {}): Promise<ActivityLog> {
        const query = `
            INSERT INTO activity_logs (user_id, action, target, details)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [userId, action, target, JSON.stringify(details)]);
        return result.rows[0];
    },

    async getActivityLogs(
        filter?: { action?: string; userId?: number },
        page: number = 1,
        limit: number = 10
    ): Promise<{ logs: ActivityLog[]; total: number }> {
        let whereClause = '';
        const values: any[] = [];
        
        if (filter?.action) {
            values.push(filter.action);
            whereClause += ` WHERE action = $${values.length}`;
        }
        
        if (filter?.userId) {
            values.push(filter.userId);
            whereClause += whereClause ? ' AND' : ' WHERE';
            whereClause += ` user_id = $${values.length}`;
        }

        const offset = (page - 1) * limit;
        values.push(limit, offset);

        const query = `
            SELECT 
                al.*,
                u.username as user_name
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${values.length - 1}
            OFFSET $${values.length}
        `;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM activity_logs
            ${whereClause}
        `;

        const [logsResult, countResult] = await Promise.all([
            pool.query(query, values),
            pool.query(countQuery, values.slice(0, -2))
        ]);

        return {
            logs: logsResult.rows,
            total: parseInt(countResult.rows[0].total)
        };
    }
}; 