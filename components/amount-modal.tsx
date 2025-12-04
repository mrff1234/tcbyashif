"use client"

import { useState } from "react"

interface AmountModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  onSubmit: (amount: number) => void
}

export function AmountModal({ isOpen, title, onClose, onSubmit }: AmountModalProps) {
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    const numAmount = Number.parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }
    onSubmit(numAmount)
    setAmount("")
    setError("")
  }

  const handleClose = () => {
    setAmount("")
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError("")
            }}
            placeholder="Enter amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            autoFocus
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSubmit()
            }}
          />
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
