import { db, type Person } from "@/lib/db"

export class PersonRepository {
  async addPerson(
    name: string,
    initialBalance: number,
    type: "taken" | "received",
    mobileNumber: string,
    description: string,
  ): Promise<number> {
    const balance = type === "taken" ? initialBalance : -initialBalance
    return await db.people.add({
      name,
      mobileNumber,
      description,
      balance,
      createdAt: new Date().toISOString(),
    })
  }

  async getPeople(): Promise<Person[]> {
    return await db.people.toArray()
  }

  async getPerson(id: number): Promise<Person | undefined> {
    return await db.people.get(id)
  }

  async updateBalance(id: number, newBalance: number): Promise<void> {
    await db.people.update(id, { balance: newBalance })
  }

  async deletePerson(id: number): Promise<void> {
    await db.people.delete(id)
    await db.transactions.where("personId").equals(id).delete()
  }
}

export const personRepository = new PersonRepository()
