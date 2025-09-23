import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { token, userId } = await req.json();

    if (!token && !userId) {
      return NextResponse.json({ error: 'Token or User ID is required' }, { status: 400 });
    }

    let targetUserId = userId;

    // If token is provided, verify and extract user ID
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        targetUserId = decoded.id || decoded.userId;
      } catch (error) {
        return NextResponse.json({ error: 'Invalid or expired activation token' }, { status: 400 });
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // if (user.activa) {
    //   return NextResponse.json({ message: 'Account is already activated' });
    // }

    // Activate the user account
    await db.user.update({
      where: { id: targetUserId },
      data: {
        // isActive: true,
        // activatedAt: new Date(),
      },
    });

    // Log the activation
    await db.adminActivity.create({
      data: {
        userId: targetUserId,
        action: ["تفعيل حساب"],
        details:[ `تم تفعيل حساب المستخدم: ${user.email}`],
        type: "account_activation",
        path: "/api/auth/activate",
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Error activating account:', error);
    return NextResponse.json({ error: 'Failed to activate account' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    if (!token && !userId) {
      return NextResponse.json({ error: 'Token or User ID is required' }, { status: 400 });
    }

    let targetUserId = userId;

    // If token is provided, verify and extract user ID
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        targetUserId = decoded.id || decoded.userId;
      } catch (error) {
        return NextResponse.json({ error: 'Invalid or expired activation token' }, { status: 400 });
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        username: true,
        // isActive: true,
        // : true,
        // activatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user,
      // needsActivation: !user.isActive,
    });
  } catch (error) {
    console.error('Error checking activation status:', error);
    return NextResponse.json({ error: 'Failed to check activation status' }, { status: 500 });
  }
}

