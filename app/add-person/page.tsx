"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePeople } from "@/hooks/use-people"

export default function AddPersonPage() {
  const router = useRouter()
  const { addPerson } = usePeople()
  const [name, setName] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"taken" | "received">("taken")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !amount.trim() || !mobileNumber.trim() || !description.trim()) return

    setIsSubmitting(true)
    try {
      await addPerson(name.trim(), Number.parseFloat(amount), type, mobileNumber.trim(), description.trim())
      router.push("/home")
    } catch (error) {
      console.error("Error adding person:", error)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900">Add Person</h1>
        <p className="text-gray-600 mt-1">Add a new person to track money</p>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter person's name"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Mobile Number Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Mobile Number</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter mobile number"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or description"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              required
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Opening Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Type</label>
            <div className="space-y-3">
              <label
                className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                style={{ borderColor: type === "taken" ? "rgb(37, 99, 235)" : "rgb(209, 213, 219)" }}
              >
                <input
                  type="radio"
                  value="taken"
                  checked={type === "taken"}
                  onChange={(e) => setType(e.target.value as "taken" | "received")}
                  className="w-4 h-4"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Taken From Me</p>
                  <p className="text-sm text-gray-600">Balance increases</p>
                </div>
              </label>

              <label
                className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                style={{ borderColor: type === "received" ? "rgb(37, 99, 235)" : "rgb(209, 213, 219)" }}
              >
                <input
                  type="radio"
                  value="received"
                  checked={type === "received"}
                  onChange={(e) => setType(e.target.value as "taken" | "received")}
                  className="w-4 h-4"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Given To Me</p>
                  <p className="text-sm text-gray-600">Balance decreases</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !amount.trim() || !mobileNumber.trim() || !description.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}
