import mongoose, { Schema, Document } from 'mongoose'

export interface Sale extends Document {
  item: mongoose.Schema.Types.ObjectId
  quantity: number
  totalPrice: number
  saleDate: Date
  description?: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const salesSchema: Schema<Sale> = new Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    saleDate: { type: Date, default: Date.now },
    description: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true },
)

const Sale =mongoose.models.Sale as mongoose.Model<Sale> || mongoose.model<Sale>('Sale', salesSchema)

export default Sale
