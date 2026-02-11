import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/connectDB'
import Sale from '@/model/sales.model'
import mongoose from 'mongoose'

// --- GET SINGLE SALE ---
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
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid sale ID' }, { status: 400 })
    }

    const sale = await Sale.findById(id).populate('item')

    if (!sale) {
      return NextResponse.json({ message: 'Sale not found' }, { status: 404 })
    }

    return NextResponse.json({ sale }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}

// --- UPDATE SALE ---
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
    const { quantity, description } = body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid sale ID' }, { status: 400 })
    }

    const sale = await Sale.findById(id)

    if (!sale) {
      return NextResponse.json({ message: 'Sale not found' }, { status: 404 })
    }

    // Update fields if provided
    // Note: Your original logic does not re-adjust item stock on update.
    // If you need that, you would need to import Item model and calculate the difference.
    if (quantity !== undefined) sale.quantity = quantity
    if (description !== undefined) sale.description = description

    await sale.save()

    return NextResponse.json(
      { message: 'Sale updated successfully', sale },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}

// --- DELETE SALE (Soft Delete) ---
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid sale ID' }, { status: 400 })
    }

    // Perform Soft Delete
    const sale = await Sale.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true },
    )

    if (!sale) {
      return NextResponse.json({ message: 'Sale not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Sale deleted successfully' },
      { status: 200 },
    )
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 },
    )
  }
}
