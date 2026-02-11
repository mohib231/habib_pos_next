import mongoose,{Schema,Document} from 'mongoose'

export interface Category extends Document{
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema: Schema<Category> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true },
)

const Category =mongoose.models.Category as mongoose.Model<Category>  || mongoose.model<Category>('Category', categorySchema)

export default Category
