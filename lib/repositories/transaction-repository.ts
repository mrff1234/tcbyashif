import { db, type Transaction } from "@/lib/db"

export class TransactionRepository {
  async addTransaction(
    personId: number,
    amount: number,
    type: "taken" | "received",
    runningBalance: number,
  ): Promise<void> {
    await db.transactions.add({
      personId,
      amount,
      type,
      dateTime: new Date().toISOString(),
      runningBalance,
    })
  }

  async getTransactionsByPerson(personId: number): Promise<Transaction[]> {
    return await db.transactions.where("personId").equals(personId).toArray()
  }

  async deleteTransactionsByPerson(personId: number): Promise<void> {
    await db.transactions.where("personId").equals(personId).delete()
  }
}

export const transactionRepository = new TransactionRepository()
