"use client"

import { useState, useEffect } from "react"
import type { Transaction } from "@/lib/db"
import { transactionRepository } from "@/lib/repositories/transaction-repository"

export function useTransactions(personId: number | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadTransactions = async () => {
    if (!personId) return
    setIsLoading(true)
    const data = await transactionRepository.getTransactionsByPerson(personId)
    setTransactions(data.reverse())
    setIsLoading(false)
  }

  useEffect(() => {
    loadTransactions()
    const interval = setInterval(loadTransactions, 500)
    return () => clearInterval(interval)
  }, [personId])

  const addTransaction = async (amount: number, type: "taken" | "received", runningBalance: number) => {
    if (!personId) return
    await transactionRepository.addTransaction(personId, amount, type, runningBalance)
    await loadTransactions()
  }

  return { transactions, isLoading, addTransaction, loadTransactions }
}
