import Category from './Category'

export default interface Item {
  _id: string
  name: string
  category: Category | null // Populated object or null
  description?: string
  price: number
  stock: number
  status: 'active' | 'inactive'
}
