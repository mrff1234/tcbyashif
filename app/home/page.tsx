"use client"

import type React from "react"
import { useState, useMemo, useRef, useEffect } from "react"
import Link from "next/link"
import { usePeople } from "@/hooks/use-people"
import { useShopSettings } from "@/hooks/use-shop-settings"
import { PersonCard } from "@/components/person-card"
import { backupAllData, restoreAllData, downloadBackup } from "@/lib/backup"

export default function HomePage() {
  const { people, isLoading, deletePerson, refetch } = usePeople()
  const { shopName, updateShopName } = useShopSettings()
  const [searchQuery, setSearchQuery] = useState("")
  const [backupMessage, setBackupMessage] = useState("")
  const [isEditingShop, setIsEditingShop] = useState(false)
  const [editShopName, setEditShopName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditShopName(shopName)
  }, [shopName])

  const filteredPeople = useMemo(() => {
    return people.filter((person) => person.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [people, searchQuery])

  const handleDelete = async (id: number) => {
    await deletePerson(id)
  }

  const handleSaveShopName = async () => {
    if (editShopName.trim()) {
      await updateShopName(editShopName.trim())
      setIsEditingShop(false)
    }
  }

  const handleBackup = async () => {
    try {
      const backupData = await backupAllData()
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0]
      downloadBackup(backupData, `money-tracker-backup-${timestamp}.json`)
      setBackupMessage("✓ Backup downloaded successfully!")
      setTimeout(() => setBackupMessage(""), 3000)
    } catch (error) {
      setBackupMessage("✗ Backup failed: " + (error instanceof Error ? error.message : "Unknown error"))
      setTimeout(() => setBackupMessage(""), 3000)
    }
  }

  const handleRestoreClick = () => {
    fileInputRef.current?.click()
  }

  const handleRestoreFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      await restoreAllData(content)
      await refetch()
      setBackupMessage("✓ Data restored successfully!")
      setTimeout(() => setBackupMessage(""), 3000)
    } catch (error) {
      setBackupMessage("✗ Restore failed: " + (error instanceof Error ? error.message : "Unknown error"))
      setTimeout(() => setBackupMessage(""), 3000)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Money Tracker</h1>
            <p className="text-gray-600">Track money given and received</p>
          </div>
        </div>

        {/* Shop Name Profile Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          {isEditingShop ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editShopName}
                onChange={(e) => setEditShopName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter shop name"
                autoFocus
              />
              <button
                onClick={handleSaveShopName}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingShop(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Shop Name</p>
                <p className="text-2xl font-bold text-gray-900">{shopName}</p>
              </div>
              <button
                onClick={() => setIsEditingShop(true)}
                className="text-blue-600 hover:text-blue-900 font-semibold py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Add Person Button */}
        <div className="mb-6">
          <Link href="/add-person">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              + Add Person
            </button>
          </Link>
        </div>

        <div className="mb-6 flex gap-3">
          <button
            onClick={handleBackup}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            ↓ Backup All
          </button>
          <button
            onClick={handleRestoreClick}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            ↑ Restore All
          </button>
        </div>

        {backupMessage && (
          <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
            {backupMessage}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleRestoreFile}
          className="hidden"
          aria-label="Restore backup file"
        />

        {/* People List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {people.length === 0 ? 'No people added yet. Click "+ Add Person" to get started.' : "No results found."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPeople.map((person) => (
              <Link key={person.id} href={`/person/${person.id}`}>
                <PersonCard person={person} onClick={() => {}} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
