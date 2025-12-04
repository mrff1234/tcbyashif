"use client"

import { useState, useEffect } from "react"
import type { Person } from "@/lib/db"
import { personRepository } from "@/lib/repositories/person-repository"

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadPeople = async () => {
    setIsLoading(true)
    const data = await personRepository.getPeople()
    setPeople(data.sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0)))
    setIsLoading(false)
  }

  useEffect(() => {
    loadPeople()
  }, [])

  const addPerson = async (
    name: string,
    initialBalance: number,
    type: "taken" | "received",
    mobileNumber: string,
    description: string,
  ) => {
    await personRepository.addPerson(name, initialBalance, type, mobileNumber, description)
    await loadPeople()
  }

  const deletePerson = async (id: number) => {
    await personRepository.deletePerson(id)
    await loadPeople()
  }

  const refetch = async () => {
    await loadPeople()
  }

  return { people, isLoading, addPerson, deletePerson, loadPeople, refetch }
}
