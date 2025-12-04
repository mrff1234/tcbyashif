"use client"

import type { Person } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"

interface PersonCardProps {
  person: Person
  onClick: () => void
}

export function PersonCard({ person, onClick }: PersonCardProps) {
  const balance = person.balance ?? 0
  const isCleared = balance === 0
  const isPending = balance > 0

  const bgColor = isCleared ? "bg-green-50" : isPending ? "bg-red-50" : "bg-blue-50"
  const borderColor = isCleared ? "border-green-200" : isPending ? "border-red-200" : "border-blue-200"
  const textColor = isCleared ? "text-green-900" : isPending ? "text-red-900" : "text-blue-900"
  const amountColor = isCleared ? "text-green-700" : isPending ? "text-red-700" : "text-blue-700"

  return (
    <div
      onClick={onClick}
      className={`${bgColor} ${borderColor} border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md active:scale-95`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`${textColor} font-semibold text-lg`}>{person.name}</h3>
          <p className={`${textColor} text-sm opacity-75 mt-1`}>📱 {person.mobileNumber}</p>
          <p className={`${textColor} text-xs opacity-60 mt-1`}>{person.description}</p>
          <p className={`${textColor} text-sm opacity-75 mt-2`}>
            {isCleared ? "ALL CLEAR" : isPending ? "PENDING" : "YOU RECEIVE"}
          </p>
        </div>
        <p className={`${amountColor} font-bold text-lg`}>{formatCurrency(Math.abs(balance))}</p>
      </div>
    </div>
  )
}
