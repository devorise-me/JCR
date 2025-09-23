import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { action, email, token, newPassword } = await req.json();

    if (action === 'request') {
      // Request password reset
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return NextResponse.json({ 
          success: true, 
          message: 'If the email exists, a reset link will be sent' 
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          type: 'password_reset' 
        },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      // Store reset token in database
      await db.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        },
      });

      // Log the password reset request
      await db.adminActivity.create({
        data: {
          userId: user.id,
          action: ["طلب إعادة تعيين كلمة المرور"],
          details:[ `تم طلب إعادة تعيين كلمة المرور للمستخدم: ${user.email}`],
          path: "/api/auth/reset-password",
          type: "password_reset_request",
          // action: "طلب إعادة تعيين كلمة المرور", --- IGNORE ---
          // details: `تم طلب إعادة تعيين كلمة المرور للمستخدم: ${user.email}`, --- IGNORE ---
          timestamp: new Date(),
        },
      });

      // In a real application, you would send an email here
      // For now, we'll return the token for testing purposes
      return NextResponse.json({
        success: true,
        message: 'Password reset link has been sent to your email',
        // Remove this in production - only for testing
        resetToken: resetToken,
      });
    }

    if (action === 'reset') {
      // Reset password with token
      if (!token || !newPassword) {
        return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as any;
      } catch (error) {
        return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
      }

      if (decoded.type !== 'password_reset') {
        return NextResponse.json({ error: 'Invalid token type' }, { status: 400 });
      }

      // Check if token exists in database and is not expired
      const resetRecord = await db.passwordReset.findFirst({
        where: {
          token,
          userId: decoded.id,
          // used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!resetRecord) {
        return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 10);

      // Update user password
      await db.user.update({
        where: { id: decoded.id },
        data: {
          password: hashedPassword,
        },
      });

      // Mark reset token as used
      await db.passwordReset.update({
        where: { id: resetRecord.id },
        data: {
          // used: true,
          usedAt: new Date(),
        },
      });

      // Log the password reset
      await db.adminActivity.create({
        data: {
          userId: decoded.id,
          action: ["إعادة تعيين كلمة المرور"],
          details:[ `تم إعادة تعيين كلمة المرور للمستخدم: ${decoded.email}`],
          path: "/api/auth/reset-password",
          type: "password_reset",
          timestamp: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in password reset:', error);
    return NextResponse.json({ error: 'Failed to process password reset' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (decoded.type !== 'password_reset') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 400 });
    }

    // Check if token exists in database and is not expired
    const resetRecord = await db.passwordReset.findFirst({
      where: {
        token,
        userId: decoded.id,
        // used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      email: decoded.email,
      expiresAt: resetRecord.expiresAt,
    });
  } catch (error) {
    console.error('Error validating reset token:', error);
    return NextResponse.json({ error: 'Failed to validate reset token' }, { status: 500 });
  }
}

