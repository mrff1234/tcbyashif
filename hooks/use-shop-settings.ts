"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/db"

export function useShopSettings() {
  const [shopName, setShopNameState] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadShopName = async () => {
      try {
        const settings = await db.shopSettings.toArray()
        if (settings.length > 0) {
          setShopNameState(settings[0].shopName || "My Shop")
        } else {
          setShopNameState("My Shop")
        }
      } catch (error) {
        console.error("Error loading shop settings:", error)
        setShopNameState("My Shop")
      } finally {
        setIsLoading(false)
      }
    }
    loadShopName()
  }, [])

  const updateShopName = async (newName: string) => {
    try {
      const settings = await db.shopSettings.toArray()
      if (settings.length > 0) {
        await db.shopSettings.update(settings[0].id!, { shopName: newName })
      } else {
        await db.shopSettings.add({ shopName: newName })
      }
      setShopNameState(newName)
    } catch (error) {
      console.error("Error updating shop settings:", error)
    }
  }

  return { shopName, isLoading, updateShopName }
}
