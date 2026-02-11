'use client'

import React, { useState, useEffect } from 'react'
import {
  Trash2,
  Search,
  ShoppingCart,
  Printer,
  AlertCircle,
  CheckCircle,
  Receipt,
  Package,
  RefreshCcw,
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { Item } from '@/types'
import { authenticatedFetch } from '@/utils/api'

// Extended interface for Cart Item
interface CartItem extends Item {
  quantity: number
}

interface ReceiptData {
  items: CartItem[]
  total: number
  date: Date
  cashier: string
  receiptNo: string
}

export default function SalesPage() {
  const { user } = useUser()
  const [items, setItems] = useState<Item[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'error' | 'success' | null
    message: string | null
  }>({ type: null, message: null })
  const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setIsLoading(true)
    try {
      const response = await authenticatedFetch(`/api/items`)
      const data = await response.json()
      setItems(
        data.items?.filter(
          (item: Item) => item.status === 'active' && item.stock > 0,
        ) || [],
      )
    } catch (error) {
      showStatus('error', 'Failed to fetch items')
    } finally {
      setIsLoading(false)
    }
  }

  const showStatus = (type: 'error' | 'success', message: string) => {
    setStatus({ type, message })
    setTimeout(() => setStatus({ type: null, message: null }), 3000)
  }

  const addToCart = (item: Item) => {
    if (lastReceipt && cart.length === 0) {
      setLastReceipt(null)
    }
    const existingItem = cart.find((cartItem) => cartItem._id === item._id)
    if (existingItem) {
      if (existingItem.quantity >= item.stock) {
        showStatus('error', 'Not enough stock available')
        return
      }
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        ),
      )
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item._id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    const item = items.find((i) => i._id === itemId)
    if (!item) return

    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }
    if (newQuantity > item.stock) {
      showStatus('error', 'Not enough stock available')
      return
    }
    setCart(
      cart.map((cartItem) =>
        cartItem._id === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem,
      ),
    )
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showStatus('error', 'Cart is empty')
      return
    }
    setIsLoading(true)
    try {
      const salesPromises = cart.map((item) =>
        authenticatedFetch(`/api/sales`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item: item._id,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
            description: `Sale by ${user?.username || 'Cashier'}`,
          }),
        }),
      )
      const responses = await Promise.all(salesPromises)
      const allSuccessful = responses.every((res) => res.ok)

      if (allSuccessful) {
        const receipt: ReceiptData = {
          items: cart,
          total: calculateTotal(),
          date: new Date(),
          cashier: user?.username || 'Cashier',
          receiptNo: `RCP-${Date.now()}`,
        }
        setLastReceipt(receipt)
        setCart([])
        showStatus('success', 'Sale completed successfully!')
        fetchItems()
      } else {
        showStatus('error', 'Failed to complete sale')
      }
    } catch (error) {
      showStatus('error', 'Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const startNewSale = () => {
    setLastReceipt(null)
    setCart([])
  }

  const generateReceiptHTML = (receipt: ReceiptData) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receipt.receiptNo}</title>
        <style>
          @media print {
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; padding: 0; }
          }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
            line-height: 1.4;
          }
          .receipt { border: 1px dashed #000; padding: 10px; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
          .receipt-no { font-size: 11px; margin-top: 5px; }
          .info { font-size: 11px; margin-bottom: 10px; }
          .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .item-name { flex: 1; }
          .item-qty { width: 30px; text-align: center; }
          .item-price { width: 60px; text-align: right; }
          .totals { margin-top: 10px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .grand-total { font-size: 16px; font-weight: bold; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 15px; font-size: 11px; border-top: 1px dashed #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="company-name">Phone Fixer</div>
            <div>Point of Sale System</div>
            <div class="receipt-no">Receipt #: ${receipt.receiptNo}</div>
          </div>
          <div class="info">
            <div>Date: ${new Date(receipt.date).toLocaleString()}</div>
            <div>Cashier: ${receipt.cashier}</div>
          </div>
          <div class="items">
            <div style="font-weight: bold; margin-bottom: 8px;">
              <div class="item">
                <div class="item-name">ITEM</div>
                <div class="item-qty">QTY</div>
                <div class="item-price">AMOUNT</div>
              </div>
            </div>
            ${receipt.items
              .map(
                (item) => `
              <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">Rs${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `,
              )
              .join('')}
          </div>
          <div class="totals">
            <div class="total-row">
              <div>Subtotal:</div>
              <div>Rs${receipt.total.toFixed(2)}</div>
            </div>
            <div class="total-row grand-total">
              <div>TOTAL:</div>
              <div>Rs${receipt.total.toFixed(2)}</div>
            </div>
          </div>
          <div class="footer">
            <div>Thank you for your purchase!</div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const printReceipt = () => {
    if (!lastReceipt) return
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const receiptContent = generateReceiptHTML(lastReceipt)
      printWindow.document.write(receiptContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      {/* The rest of the Sales UI remains exactly as your React code, 
            just ensure you close your tags correctly. 
            I am omitting the HTML body for brevity, paste your 
            Sales.js return statement here. */}

      {/* Simplified PlaceHolder for the UI */}
      <div>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" />
            Point of Sale
          </h1>

          {/* Status Alert */}
          {status.message && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                status.type === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-green-50 text-green-600 border border-green-200'
              }`}
            >
              {status.type === 'error' ? (
                <AlertCircle size={20} />
              ) : (
                <CheckCircle size={20} />
              )}
              {status.message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                    {filteredItems.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => addToCart(item)}
                        className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg border border-indigo-200 transition-colors text-left"
                      >
                        <div className="font-semibold text-gray-800 mb-1">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {item.category?.name}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-indigo-600">
                            Rs{item.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Stock: {item.stock}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredItems.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No items available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Receipt />
                  Current Sale
                </h2>

                {cart.length === 0 ? (
                  // Logic: If cart is empty, check if we have a recent receipt
                  lastReceipt ? (
                    // STATE: SALE COMPLETED
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Sale Completed!
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Receipt #{lastReceipt.receiptNo}
                      </p>

                      <div className="space-y-3">
                        <button
                          onClick={printReceipt}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                        >
                          <Printer size={20} />
                          Print Receipt
                        </button>

                        <button
                          onClick={startNewSale}
                          className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                        >
                          <RefreshCcw size={18} />
                          Start New Sale
                        </button>
                      </div>
                    </div>
                  ) : (
                    // STATE: EMPTY CART (Default)
                    <div className="text-center py-12 text-gray-500">
                      <ShoppingCart
                        size={48}
                        className="mx-auto mb-4 text-gray-300"
                      />
                      <p>Cart is empty</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Select items to begin
                      </p>
                    </div>
                  )
                ) : (
                  // STATE: ACTIVE CART
                  <>
                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item._id}
                          className="bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                Rs{item.price.toFixed(2)} each
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item._id, item.quantity - 1)
                                }
                                className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(
                                    item._id,
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                                min="1"
                              />
                              <button
                                onClick={() =>
                                  updateQuantity(item._id, item.quantity + 1)
                                }
                                className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                            <div className="font-bold text-gray-800">
                              Rs{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">
                          Rs{calculateTotal().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-semibold">Rs0.00</span>
                      </div>
                      <div className="flex justify-between text-2xl font-bold border-t border-gray-200 pt-2">
                        <span>Total:</span>
                        <span className="text-indigo-600">
                          Rs{calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : 'Complete Sale'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
