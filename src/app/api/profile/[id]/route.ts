import connectDB from '@/lib/connectDB'
import User from '@/model/users.model'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

type RouteContext = {
  params: Promise<{ id: string }>
}

// --- GET USER PROFILE ---

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    await connectDB()
    const { username, password } = await request.json()
    const { id } = await context.params

    const userId = id

    const authUserId = request.headers.get('x-user-id')

    if (!authUserId || !mongoose.Types.ObjectId.isValid(authUserId)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 },
      )
    }

    if (authUserId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 },
      )
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      )
    }

    if (typeof username === 'string' && username.trim()) {
      user.username = username.trim()
    }
    if (typeof password === 'string' && password) {
      user.password = password
    }

    await user.save()

    return NextResponse.json(
      { success: true, message: 'Profile updated successfully' },
      { status: 200 },
    )
  } catch (error) {
    console.error('error updating profile:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
