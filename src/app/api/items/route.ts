import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/connectDB'
import Item from '@/model/items.model' // Ensure this path matches your file structure
import Category from '@/model/category.model' // Import needed for population
import mongoose from 'mongoose'

// --- GET ALL ITEMS ---
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.headers.get('x-user-id')
    console.log('calling from items api, userId:', userId)

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Using your logic: fetch only active items and populate category name
    const items = await Item.find({ status: 'active' })
      .populate('category', 'name')
      .sort({ createdAt: -1 })

    return NextResponse.json({ items }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}

// --- CREATE ITEM ---
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.headers.get('x-user-id')

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { name, description, price, stock, category } = body

    // Validation Logic
    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 },
      )
    }

    // Check if category exists
    const categoryObject = await Category.findById(category)
    if (!categoryObject) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 },
      )
    }

    if (!name || stock === undefined) {
      return NextResponse.json(
        { message: 'Name and stock are required fields' },
        { status: 400 },
      )
    }

    const newItem = await Item.create({
      name,
      description,
      price,
      stock,
      category,
      status: 'active', // Defaulting to active as per your schema
    })

    return NextResponse.json(
      { message: 'Item created successfully', item: newItem },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}
