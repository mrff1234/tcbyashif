import { db, type Person, type Transaction } from "./db"

export interface BackupData {
  version: string
  timestamp: string
  people: Person[]
  transactions: Transaction[]
}

export async function backupAllData(): Promise<string> {
  const people = await db.people.toArray()
  const transactions = await db.transactions.toArray()

  const backup: BackupData = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    people,
    transactions,
  }

  return JSON.stringify(backup, null, 2)
}

export async function restoreAllData(jsonData: string): Promise<void> {
  try {
    const backup: BackupData = JSON.parse(jsonData)

    // Validate backup format
    if (!backup.version || !backup.people || !backup.transactions) {
      throw new Error("Invalid backup file format")
    }

    // Clear existing data
    await db.people.clear()
    await db.transactions.clear()

    // Restore people
    await db.people.bulkAdd(backup.people)

    // Restore transactions
    await db.transactions.bulkAdd(backup.transactions)
  } catch (error) {
    throw new Error(`Restore failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function downloadBackup(data: string, filename = "money-tracker-backup.json"): void {
  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
