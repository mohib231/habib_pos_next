import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/connectDB'
import Category from '@/model/category.model' // Adjust path if needed (e.g., @/model/Category)
import mongoose from 'mongoose'

// --- GET ALL CATEGORIES ---
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const userId = req.headers.get('x-user-id')
    console.log('calling from categories api, userId:', userId)

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }


    const categories = await Category.find()

    return NextResponse.json({ categories }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}

// --- CREATE CATEGORY ---
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const userId = req.headers.get('x-user-id')

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { message: 'Name is a required field' },
        { status: 400 },
      )
    }

    const newCategory = await Category.create({ name, description })

    return NextResponse.json(
      { message: 'Category created successfully', category: newCategory },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}
