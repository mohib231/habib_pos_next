import connectDB from '@/lib/connectDB'
import User from '@/model/users.model'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { email, password, resetToken } = await request.json()
    const user = await User.findOne({
      email,
    })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 400 },
      )
    }
    if (
      user.resetPasswordToken !==
      crypto.createHash('sha256').update(resetToken).digest('hex')
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 },
      )
    }

    user.password = password
    await user.save()

    return NextResponse.json(
      { success: true, data: { token: 'dummy-token' } },
      { status: 200 },
    )
  } catch (error) {
    console.error('error signing in user:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
