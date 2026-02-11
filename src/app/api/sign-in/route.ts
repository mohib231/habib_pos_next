import connectDB from '@/lib/connectDB'
import User from '@/model/users.model'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 },
      )
    }

    console.log('Attempting to sign in user with email:', email)
    const user = await User.findOne({
      email,
    })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 400 },
      )
    }

    const isMatch = await user.matchPassword(password)
    console.log('Password match result:', isMatch)
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 400 },
      )
    }

    // Generate JWT token
    const jti = uuidv4() // Generate a unique identifier for the token
    user.jti = jti // Store the jti in the user's document
    await user.save() // Save the updated user document
    const token = jwt.sign({ userId: user._id, jti }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    } as jwt.SignOptions)

    return NextResponse.json(
      { success: true, data: { token } },
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
