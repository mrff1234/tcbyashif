"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { Person } from "@/lib/db"
import { personRepository } from "@/lib/repositories/person-repository"
import { transactionRepository } from "@/lib/repositories/transaction-repository"
import { usePeople } from "@/hooks/use-people"
import { useTransactions } from "@/hooks/use-transactions"
import { formatCurrency } from "@/lib/utils"
import { AmountModal } from "@/components/amount-modal"
import Link from "next/link"
import { useShopSettings } from "@/hooks/use-shop-settings"

export default function PersonDetailPage() {
  const router = useRouter()
  const params = useParams()
  const personId = Number.parseInt(params.id as string)
  const { shopName } = useShopSettings()

  const [person, setPerson] = useState<Person | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: "taken" | "received" | null
  }>({ isOpen: false, type: null })
  const [messageStatus, setMessageStatus] = useState<string | null>(null)
  const { loadPeople } = usePeople()
  const { transactions } = useTransactions(personId)

  useEffect(() => {
    const loadPerson = async () => {
      const p = await personRepository.getPerson(personId)
      setPerson(p || null)
      setIsLoading(false)
    }
    loadPerson()
  }, [personId])

  const handleMoneyTaken = async (amount: number) => {
    if (!person) return

    const newBalance = (person.balance ?? 0) + amount
    await personRepository.updateBalance(personId, newBalance)
    await transactionRepository.addTransaction(personId, amount, "taken", newBalance)

    const updatedPerson = await personRepository.getPerson(personId)
    setPerson(updatedPerson || null)
    await loadPeople()
    setModalState({ isOpen: false, type: null })
  }

  const handleMoneyReceived = async (amount: number) => {
    if (!person) return

    const newBalance = (person.balance ?? 0) - amount
    await personRepository.updateBalance(personId, newBalance)
    await transactionRepository.addTransaction(personId, amount, "received", newBalance)

    const updatedPerson = await personRepository.getPerson(personId)
    setPerson(updatedPerson || null)
    await loadPeople()
    setModalState({ isOpen: false, type: null })
  }

  const handleDeletePerson = async () => {
    if (!window.confirm(`Are you sure you want to delete ${person?.name}? This cannot be undone.`)) {
      return
    }

    await personRepository.deletePerson(personId)
    await loadPeople()
    router.push("/home")
  }

  const handleCopyMessage = () => {
    if (!person) return
    const balance = person.balance ?? 0
    const message = `${person.name} you have due ${formatCurrency(Math.abs(balance))} of ${person.description}`
    navigator.clipboard.writeText(message)
    setMessageStatus("Copied to clipboard!")
    setTimeout(() => setMessageStatus(null), 2000)
  }

  const handleSendWhatsApp = () => {
    if (!person) return
    const balance = person.balance ?? 0
    const message = `Dear ${person.name}, this is a gentle reminder that your pending amount of ${formatCurrency(Math.abs(balance))} is due at ${shopName}. Please settle it soon. Thank you! 🙏`
    const phone = person.mobileNumber.replace(/\D/g, "")
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleSendTransactions = () => {
    if (!person) return

    const lastSix = transactions.slice(0, 6)
    if (lastSix.length === 0) {
      alert("No transactions to send")
      return
    }

    let message = `${person.name} - Last ${lastSix.length} Transactions:\n\n`
    lastSix.forEach((txn) => {
      const date = new Date(txn.dateTime).toLocaleDateString("en-IN")
      const time = new Date(txn.dateTime).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
      const type = txn.type === "received" ? "Received" : "Taken"
      message += `${type}: ${formatCurrency(txn.amount)} - ${date} ${time}\n`
    })

    const phone = person.mobileNumber.replace(/\D/g, "")
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (isLoading || !person) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const balance = person.balance ?? 0
  const isCleared = balance === 0
  const isPending = balance > 0

  const bgColor = isCleared ? "bg-green-50" : isPending ? "bg-red-50" : "bg-blue-50"
  const borderColor = isCleared ? "border-green-200" : isPending ? "border-red-200" : "border-blue-200"
  const textColor = isCleared ? "text-green-900" : isPending ? "text-red-900" : "text-blue-900"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{person.name}</h1>
          <p className="text-gray-600 mt-1">📱 {person.mobileNumber}</p>
          <p className="text-gray-600 text-sm">{person.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeletePerson}
            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-colors"
            title="Delete person"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
          <Link href="/home">
            <button className="text-gray-600 hover:text-gray-900 font-semibold">← Back</button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Balance Card */}
        <div className={`${bgColor} ${borderColor} border rounded-lg p-6 mb-6`}>
          <p className={`${textColor} text-sm font-semibold opacity-75 mb-2`}>Current Balance</p>
          <p className={`${textColor} text-4xl font-bold mb-3`}>{formatCurrency(Math.abs(balance))}</p>
          <p className={`${textColor} font-semibold`}>
            {isCleared ? "✓ ALL CLEAR" : isPending ? "PENDING" : "YOU RECEIVE"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setModalState({ isOpen: true, type: "taken" })}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Money Taken
          </button>
          <button
            onClick={() => setModalState({ isOpen: true, type: "received" })}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Money Received
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleCopyMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Message
          </button>
          <button
            onClick={handleSendWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.75 5.404 2.176 7.667L2.594 21.5l8.14-2.138a9.847 9.847 0 004.742 1.205h.006c5.44 0 9.902-4.467 9.905-9.93.001-2.655-.786-5.148-2.277-7.283-1.492-2.135-3.808-3.732-6.514-4.529a9.851 9.851 0 00-4.022-.414Z" />
            </svg>
            Send WhatsApp
          </button>
        </div>

        {/* Send Transactions Button */}
        <div className="mb-6">
          <button
            onClick={handleSendTransactions}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.75 5.404 2.176 7.667L2.594 21.5l8.14-2.138a9.847 9.847 0 004.742 1.205h.006c5.44 0 9.902-4.467 9.905-9.93.001-2.655-.786-5.148-2.277-7.283-1.492-2.135-3.808-3.732-6.514-4.529a9.851 9.851 0 00-4.022-.414Z" />
            </svg>
            Send Transactions (Last 6)
          </button>
        </div>

        {/* Message status feedback */}
        {messageStatus && (
          <div className="mb-6 p-3 bg-blue-100 text-blue-800 rounded-lg text-center font-medium">{messageStatus}</div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Transaction History</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {transaction.type === "received" ? "Money Received" : "Money Taken"}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(transaction.dateTime).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${transaction.type === "received" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "received" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">Bal: {formatCurrency(transaction.runningBalance)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AmountModal
        isOpen={modalState.isOpen && modalState.type === "taken"}
        title="Money Taken"
        onClose={() => setModalState({ isOpen: false, type: null })}
        onSubmit={handleMoneyTaken}
      />
      <AmountModal
        isOpen={modalState.isOpen && modalState.type === "received"}
        title="Money Received"
        onClose={() => setModalState({ isOpen: false, type: null })}
        onSubmit={handleMoneyReceived}
      />
    </div>
  )
}
