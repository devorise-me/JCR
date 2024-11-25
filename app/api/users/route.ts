import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {

        const users = await db.user.findMany({
            select: {
                id: true,
                username: true,
                FirstName: true,
                FamilyName: true,
            },
            orderBy: {
                username: 'asc',
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}