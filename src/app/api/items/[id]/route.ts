import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/connectDB'
import Item from '@/model/items.model'
import Category from '@/model/category.model'
import mongoose from 'mongoose'

// --- GET SINGLE ITEM (By ID or Name) ---
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
    const idOrName = params.id // Next.js captures the dynamic route part here

    let query = {}
    if (mongoose.Types.ObjectId.isValid(idOrName)) {
      query = { _id: idOrName }
    } else {
      // Regex search for name, exactly as you had it
      query = { name: { $regex: `^${idOrName}$`, $options: 'i' } }
    }

    const item = await Item.findOne(query).populate('category', 'name')

    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ item }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}

// --- UPDATE ITEM ---
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
    const { name, description, price, stock, categoryId } = body

    // Build update object dynamically
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (price !== undefined) updates.price = price
    if (stock !== undefined) updates.stock = stock

    // Category Validation inside Update
    if (categoryId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json(
          { message: 'Invalid category ID' },
          { status: 400 },
        )
      }
      const category = await Category.findById(categoryId)
      if (!category) {
        return NextResponse.json(
          { message: 'Category not found' },
          { status: 404 },
        )
      }
      updates.category = categoryId
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: 'No fields provided to update' },
        { status: 400 },
      )
    }

    const updatedItem = await Item.findByIdAndUpdate(id, updates, { new: true })

    if (!updatedItem) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Item updated successfully', item: updatedItem },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}

// --- DELETE ITEM (Soft Delete) ---
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

    // We use findByIdAndUpdate to perform a "Soft Delete" (setting status to inactive)
    const deletedItem = await Item.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true },
    )

    if (!deletedItem) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Item deleted successfully' },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}
