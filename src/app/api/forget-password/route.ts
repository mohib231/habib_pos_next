import User from '@/model/users.model'
import connectDB from '@/lib/connectDB'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import ForgetPasswordEmail from '../../../../email/ForgetPasswordEmail'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { email } = await request.json()
    const user = await User.findOne({
      email,
    })
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            'If an account with that email exists, a password reset link has been sent',
        },
        { status: 200 },
      )
    }
    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    // You might want to hash this token before saving it to the database for security
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
    user.resetPasswordToken = hashedToken
    await user.save()
    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`
    await ForgetPasswordEmail(email, resetLink)
    return NextResponse.json(
      {
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent',
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('error in forget password:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
