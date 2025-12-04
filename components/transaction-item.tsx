"use client"

import type { Transaction } from "@/lib/db"
import { formatCurrency, formatDateTime } from "@/lib/utils"

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isReceived = transaction.type === "received"

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{isReceived ? "Money Received" : "Money Taken"}</p>
        <p className="text-sm text-gray-500">{formatDateTime(transaction.dateTime)}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isReceived ? "text-green-600" : "text-red-600"}`}>
          {isReceived ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-gray-500">Balance: {formatCurrency(transaction.runningBalance)}</p>
      </div>
    </div>
  )
}
