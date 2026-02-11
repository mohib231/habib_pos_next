import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/connectDB'
import Sale from '@/model/sales.model' // Adjust path if folder is 'model' vs 'models'
import Item from '@/model/items.model'
import mongoose from 'mongoose'

// --- GET ALL SALES ---
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.headers.get('x-user-id')

        console.log('calling from sales api, userId:', userId)


    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Fetch only active sales and populate the item details
    const sales = await Sale.find({ status: 'active' }).populate('item')

    return NextResponse.json({ sales }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}

// --- RECORD NEW SALE (POST) ---
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const userId = req.headers.get('x-user-id')

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { item, quantity, description } = body

    // 1. Validate Item ID
    if (!item || !mongoose.Types.ObjectId.isValid(item)) {
      return NextResponse.json({ message: 'Invalid item ID' }, { status: 400 })
    }

    // 2. Find the Item to check stock
    const itemObject = await Item.findById(item)
    if (!itemObject) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }

    // 3. Check Stock Availability
    if (itemObject.stock < quantity) {
      return NextResponse.json(
        { message: 'Insufficient stock for this sale' },
        { status: 400 },
      )
    }

    // 4. Calculate Total Price
    const totalPrice = (itemObject.price || 0) * quantity

    // 5. Create Sale Record
    const newSale = new Sale({
      item,
      quantity,
      totalPrice,
      description,
      status: 'active', // Ensure default status is set
    })

    await newSale.save()

    // 6. Deduct Stock from Item
    itemObject.stock -= quantity
    await itemObject.save()

    return NextResponse.json(
      { message: 'Sale recorded successfully', sale: newSale },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Error recording sale:', error)
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}
