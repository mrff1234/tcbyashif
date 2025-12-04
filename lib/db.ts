import Dexie, { type Table } from "dexie"

export interface Person {
  id?: number
  name: string
  mobileNumber: string
  description: string
  balance: number
  createdAt: string
}

export interface Transaction {
  id?: number
  personId: number
  amount: number
  type: "taken" | "received"
  dateTime: string
  runningBalance: number
}

export interface ShopSettings {
  id?: number
  shopName: string
}

export class AppDatabase extends Dexie {
  people!: Table<Person>
  transactions!: Table<Transaction>
  shopSettings!: Table<ShopSettings>

  constructor() {
    super("MoneyTrackerDB")
    this.version(1).stores({
      people: "++id, name, mobileNumber, description",
      transactions: "++id, personId, dateTime",
      shopSettings: "++id", // added shop settings table
    })
  }
}

export const db = new AppDatabase()
