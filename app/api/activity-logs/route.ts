import { NextResponse } from 'next/server';
import pool from '@/app/database/config';
import { dbUtils } from '@/app/database/utils';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const action = searchParams.get('action');
        const userId = searchParams.get('userId');

        const filterParams: { action?: string; userId?: number } = {};
        if (action && action !== 'all') {
            filterParams.action = action;
        }
        if (userId) {
            filterParams.userId = parseInt(userId);
        }

        const result = await dbUtils.getActivityLogs(filterParams, page);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity logs' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, action, target, details } = body;

        if (!userId || !action || !target) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const log = await dbUtils.createActivityLog(userId, action, target, details);
        return NextResponse.json(log);
    } catch (error) {
        console.error('Error creating activity log:', error);
        return NextResponse.json(
            { error: 'Failed to create activity log' },
            { status: 500 }
        );
    }
} 