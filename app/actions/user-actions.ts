"use server"

import { revalidatePath } from "next/cache"
import {
  getUserWatchlist,
  updateUserWatchlist,
  getUserTransactions,
  recordUserTransaction,
  getUserPortfolio,
  updateUserPortfolio,
} from "@/lib/aws/dynamodb-service"

// Server action to fetch user's watchlist
export async function fetchUserWatchlist(userId: string) {
  try {
    const watchlist = await getUserWatchlist(userId)
    return { success: true, data: watchlist }
  } catch (error) {
    console.error("Error fetching watchlist:", error)
    return { success: false, error: "Failed to fetch watchlist" }
  }
}

// Server action to update user's watchlist
export async function updateWatchlist(userId: string, symbols: string[]) {
  try {
    const result = await updateUserWatchlist(userId, symbols)
    revalidatePath("/")
    return { success: true, data: result }
  } catch (error) {
    console.error("Error updating watchlist:", error)
    return { success: false, error: "Failed to update watchlist" }
  }
}

// Server action to add stock to watchlist
export async function addToWatchlist(userId: string, symbol: string) {
  try {
    // Get current watchlist
    const watchlistResult = await fetchUserWatchlist(userId)
    if (!watchlistResult.success) {
      return watchlistResult
    }

    // Check if watchlist is an array and symbol is not already in it
    const currentWatchlist = Array.isArray(watchlistResult.data)
      ? watchlistResult.data.map((item: any) => item.symbol)
      : []

    if (currentWatchlist.includes(symbol)) {
      return { success: true, message: "Stock already in watchlist" }
    }

    // Add symbol to watchlist
    const newWatchlist = [...currentWatchlist, symbol]
    const result = await updateWatchlist(userId, newWatchlist)

    return result
  } catch (error) {
    console.error("Error adding to watchlist:", error)
    return { success: false, error: "Failed to add to watchlist" }
  }
}

// Server action to remove stock from watchlist
export async function removeFromWatchlist(userId: string, symbol: string) {
  try {
    // Get current watchlist
    const watchlistResult = await fetchUserWatchlist(userId)
    if (!watchlistResult.success) {
      return watchlistResult
    }

    // Filter out the symbol
    const currentWatchlist = Array.isArray(watchlistResult.data)
      ? watchlistResult.data.map((item: any) => item.symbol)
      : []

    const newWatchlist = currentWatchlist.filter((s: string) => s !== symbol)
    const result = await updateWatchlist(userId, newWatchlist)

    return result
  } catch (error) {
    console.error("Error removing from watchlist:", error)
    return { success: false, error: "Failed to remove from watchlist" }
  }
}

// Server action to fetch user's transactions
export async function fetchUserTransactions(userId: string) {
  try {
    const transactions = await getUserTransactions(userId)
    return { success: true, data: transactions }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return { success: false, error: "Failed to fetch transactions" }
  }
}

// Server action to record a transaction
export async function recordTransaction(userId: string, transaction: any) {
  try {
    const result = await recordUserTransaction(userId, transaction)
    revalidatePath("/")
    return { success: true, data: result }
  } catch (error) {
    console.error("Error recording transaction:", error)
    return { success: false, error: "Failed to record transaction" }
  }
}

// Server action to fetch user's portfolio
export async function fetchUserPortfolio(userId: string) {
  try {
    const portfolio = await getUserPortfolio(userId)
    return { success: true, data: portfolio }
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return { success: false, error: "Failed to fetch portfolio" }
  }
}

// Server action to update user's portfolio
export async function updatePortfolio(userId: string, portfolio: any[]) {
  try {
    const result = await updateUserPortfolio(userId, portfolio)
    revalidatePath("/")
    return { success: true, data: result }
  } catch (error) {
    console.error("Error updating portfolio:", error)
    return { success: false, error: "Failed to update portfolio" }
  }
}
