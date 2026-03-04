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
  description?: string
  notes?: string
  customer_name?: string
  customer_phone?: string
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
  const [description, setDescription] = useState('')
  const [customer_name, setCustomerName] = useState('')
  const [customer_phone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')

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
            description:
              description.trim() || `Sale by ${user?.username || 'Cashier'}`,
            customer_name: customer_name.trim() || '',
            customer_phone: customer_phone.trim() || '',
            notes: notes.trim() || '',
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
          description: description.trim(),
          customer_name: customer_name.trim(),
          customer_phone: customer_phone.trim(),
          notes: notes.trim(),
        }
        setLastReceipt(receipt)
        setCart([])
        setDescription('')
        setCustomerName('')
        setCustomerPhone('')
        setNotes('')
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
    setDescription('')
    setCustomerName('')
    setCustomerPhone('')
    setNotes('')
  }

  const generateReceiptHTML = (receipt: ReceiptData) => {
    const logoUrl = `${window.location.origin}/logo.jpeg`
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
          * { box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 12px;
            font-size: 12px;
            line-height: 1.5;
            color: #1a1a1a;
            background: #fff;
          }
          .receipt {
            border: 1px solid #ccc;
            border-radius: 6px;
            padding: 14px;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .header {
            text-align: center;
            padding-bottom: 12px;
            margin-bottom: 12px;
            border-bottom: 2px dashed #999;
          }
          .logo {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto 8px;
            display: block;
            border: 2px solid #4f46e5;
          }
          .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #4f46e5;
            letter-spacing: 1px;
            margin-bottom: 2px;
          }
          .company-sub { font-size: 10px; color: #666; margin-bottom: 6px; }
          .receipt-no {
            font-size: 11px;
            background: #f0f0ff;
            border: 1px solid #c7c7f5;
            border-radius: 4px;
            padding: 3px 8px;
            display: inline-block;
            color: #4f46e5;
            font-weight: bold;
            margin-top: 4px;
          }
          .section { margin-bottom: 10px; }
          .section-title {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            margin-bottom: 4px;
            font-weight: bold;
          }
          .info-grid { font-size: 11px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .info-label { color: #666; }
          .info-value { font-weight: 600; color: #222; text-align: right; max-width: 55%; word-break: break-word; }
          .customer-box {
            background: #f9f9ff;
            border: 1px solid #e0e0f5;
            border-radius: 4px;
            padding: 6px 8px;
            margin-bottom: 10px;
            font-size: 11px;
          }
          .items-table { width: 100%; border-collapse: collapse; margin: 0; }
          .items-section {
            border-top: 2px dashed #999;
            border-bottom: 2px dashed #999;
            padding: 8px 0;
            margin: 10px 0;
          }
          .items-header {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #888;
            font-weight: bold;
            margin-bottom: 6px;
            padding-bottom: 4px;
            border-bottom: 1px solid #eee;
          }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; align-items: flex-start; }
          .item-name { flex: 1; color: #222; }
          .item-detail { font-size: 10px; color: #888; }
          .item-qty { width: 28px; text-align: center; color: #555; }
          .item-price { width: 62px; text-align: right; font-weight: 600; color: #222; }
          .totals { margin-top: 4px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
          .total-label { color: #555; }
          .total-value { font-weight: 600; }
          .grand-total {
            display: flex;
            justify-content: space-between;
            font-size: 15px;
            font-weight: bold;
            border-top: 2px solid #4f46e5;
            padding-top: 8px;
            margin-top: 8px;
            color: #4f46e5;
          }
          .description-box {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 4px;
            padding: 6px 8px;
            font-size: 11px;
            margin-top: 2px;
            color: #14532d;
          }
          .notes-box {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 4px;
            padding: 6px 8px;
            font-size: 11px;
            margin-top: 8px;
            color: #78350f;
          }
          .footer {
            text-align: center;
            margin-top: 14px;
            font-size: 10px;
            border-top: 1px dashed #ccc;
            padding-top: 10px;
            color: #666;
          }
          .footer-brand { font-weight: bold; color: #4f46e5; font-size: 12px; margin-top: 4px; }
          .badge {
            display: inline-block;
            background: #4f46e5;
            color: white;
            font-size: 9px;
            border-radius: 3px;
            padding: 2px 6px;
            margin-top: 4px;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <img src="${logoUrl}" alt="Logo" class="logo" />
            <div class="company-name">Phone Fixer</div>
            <div class="company-sub">Point of Sale System</div>
            <div class="receipt-no">Receipt #: ${receipt.receiptNo}</div>
          </div>

          <div class="section">
            <div class="section-title">Transaction Info</div>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${new Date(receipt.date).toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Cashier:</span>
                <span class="info-value">${receipt.cashier}</span>
              </div>
            </div>
            ${receipt.description ? `<div class="description-box" style="margin-top:6px;"><strong>Service/Product:</strong> ${receipt.description}</div>` : ''}
          </div>

          ${
            receipt.customer_name || receipt.customer_phone
              ? `
          <div class="customer-box">
            <div class="section-title" style="margin-bottom:4px;">Customer</div>
            ${receipt.customer_name ? `<div class="info-row"><span class="info-label">Name:</span><span class="info-value" style="font-weight:600;">${receipt.customer_name}</span></div>` : ''}
            ${receipt.customer_phone ? `<div class="info-row"><span class="info-label">Phone:</span><span class="info-value">${receipt.customer_phone}</span></div>` : ''}
          </div>`
              : ''
          }

          <div class="items-section">
            <div class="items-header">
              <span style="flex:1;">Item</span>
              <span style="width:28px;text-align:center;">Qty</span>
              <span style="width:62px;text-align:right;">Amount</span>
            </div>
            ${receipt.items
              .map(
                (item) => `
              <div class="item">
                <div class="item-name">
                  ${item.name}
                  <div class="item-detail">Rs${item.price.toFixed(2)} each</div>
                </div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">Rs${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `,
              )
              .join('')}
          </div>

          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">Rs${receipt.total.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax:</span>
              <span class="total-value">Rs0.00</span>
            </div>
            <div class="grand-total">
              <span>TOTAL</span>
              <span>Rs${receipt.total.toFixed(2)}</span>
            </div>
          </div>

          ${receipt.notes ? `<div class="notes-box"><strong>Notes:</strong> ${receipt.notes}</div>` : ''}

          <div class="footer">
            <div>Thank you for your purchase!</div>
            <div class="footer-brand">Phone Fixer</div>
            <div class="badge">POS System</div>
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
                      <div className="space-y-3 mt-3">
                        {/* Description — about the product/service */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <label className="block text-sm font-semibold text-green-800 mb-1">
                            Service / Product Description
                          </label>
                          <p className="text-xs text-green-600 mb-1.5">
                            What product or service is being sold?
                          </p>
                          <input
                            type="text"
                            className="w-full border border-green-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none bg-white"
                            placeholder="e.g. Screen replacement, Phone repair…"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Customer Name
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                              placeholder="Full name"
                              value={customer_name}
                              onChange={(e) => setCustomerName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Phone
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                              placeholder="Number"
                              value={customer_phone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Notes — additional shopkeeper remarks */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Notes{' '}
                            <span className="font-normal text-gray-400 text-xs">
                              (additional remarks)
                            </span>
                          </label>
                          <textarea
                            rows={2}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                            placeholder="Any extra remarks for this sale…"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
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
