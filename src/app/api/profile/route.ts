import connectDB from '@/lib/connectDB'
import User from '@/model/users.model'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB()
    const userId = req.headers.get('x-user-id')

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const user = await User.findById(userId).select('-password')
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      )
    }
    return NextResponse.json({ success: true, data: user }, { status: 200 })
  } catch (error) {
    console.error('error fetching profile:', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
