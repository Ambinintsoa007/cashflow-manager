import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/auth'

type Transaction = {
  type: 'INCOME' | 'EXPENSE'
  amount: number
}

export function useFinancialSummary() {
  const { user } = useAuth()

  const [totalIncomes, setTotalIncomes] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      const transactions = (data ?? []) as Transaction[]

      const incomes = transactions
        .filter((transaction) => transaction.type === 'INCOME')
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        )

      const expenses = transactions
        .filter((transaction) => transaction.type === 'EXPENSE')
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        )

      setTotalIncomes(incomes)
      setTotalExpenses(expenses)
      setLoading(false)
    }

    fetchSummary()
  }, [user])

  const totalBenefits = totalIncomes - totalExpenses

  return {
    totalIncomes,
    totalExpenses,
    totalBenefits,
    loading,
    error,
  }
}