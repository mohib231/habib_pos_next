import mongoose,{Schema,Document} from 'mongoose'

export interface Item extends Document{
    name: string;
    category: mongoose.Schema.Types.ObjectId;
    description?: string;
    price?: number;
    stock: number;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const itemSchema: Schema<Item> = new Schema(
  {
    name: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    description: { type: String },
    price: { type: Number },
    stock: { type: Number, required: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true },
)

const Item =mongoose.models.Item as mongoose.Model<Item> || mongoose.model<Item>('Item', itemSchema)

export default Item
