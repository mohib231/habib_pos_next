import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

// 1. Define the interface for the Document
export interface IUser extends Document {
  email: string
  username: string
  password: string
  role: 'admin' | 'user'
  jti?: string
  resetPasswordToken?: string
  createdAt: Date
  updatedAt: Date
  // Define instance methods here for TS support
  matchPassword(enteredPassword: string): Promise<boolean>
}

const userSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    jti: { type: String, sparse: true, unique: true },
    resetPasswordToken: { type: String },
  },
  { timestamps: true },
)

// 2. PRE-SAVE HOOK
// Use 'this: IUser' to give you full type safety inside the function
userSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) {
    return
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error: any) {
    throw new Error('Error hashing password: ' + error.message)
  }
})

// 3. INSTANCE METHOD
userSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password)
}

// 4. MODEL EXPORT
const User =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>('User', userSchema)

export default User
