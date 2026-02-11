import mongoose from 'mongoose'

// import app from '../app.js'

import { configDotenv } from 'dotenv'
configDotenv()

type ConnectionObject = {
  isConnected?: number
}

const connection: ConnectionObject = {}


async function connectDB(): Promise<void> {
  if (connection.isConnected) {
    console.log('database is already connected')
    return
  }
  try {
    // Build the connection URI properly
    const mongoUri = process.env.MONGO_URI

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables')
    }

    const db = await mongoose.connect(mongoUri || '')
    connection.isConnected = db.connections[0].readyState
    console.log(`Database connected successfully !!! ${db.connection.host}`)
  } catch (error) {
    console.error(`MONGODB CONNECTION ERROR: ${error}`)
    process.exit(1)
  }
}

export default connectDB
