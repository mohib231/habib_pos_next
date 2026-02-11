import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/connectDB'
import Category from '@/model/category.model'
import mongoose from 'mongoose'

// --- GET SINGLE CATEGORY (By ID or Name) ---
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB()
    const userId = req.headers.get('x-user-id')

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const idOrName = params.id // Next.js captures the dynamic segment here

    let query

    // Logic: If valid ObjectId, search by _id, otherwise regex search by name
    if (mongoose.Types.ObjectId.isValid(idOrName)) {
      query = { _id: idOrName }
    } else {
      query = { name: { $regex: `^${idOrName}$`, $options: 'i' } }
    }

    // Note: Ensure your Category model has the 'items' virtual/relationship defined for populate to work
    const category = await Category.findOne(query).populate('items')

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 },
      )
    }

    return NextResponse.json({ category }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}

// --- UPDATE CATEGORY ---
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB()
    const userId = req.headers.get('x-user-id')

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const { id } = params
    const body = await req.json()
    const { name, description } = body

    // Build update object dynamically
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true },
    )

    if (!updatedCategory) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { message: 'Category updated successfully', category: updatedCategory },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}

// --- DELETE CATEGORY ---
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB()
    const userId = req.headers.get('x-user-id')

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const { id } = params

    const category = await Category.findByIdAndDelete(id)

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}
