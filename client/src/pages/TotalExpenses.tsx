import { useFinancialSummary } from '../hooks/useFinancialSummary'
import { formatAmount } from '../utils/formatAmount'

export default function TotalExpenses() {
  const { totalExpenses, loading, error } = useFinancialSummary()

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h1>Total Expenses</h1>

      <h2>{formatAmount(totalExpenses)}</h2>
    </div>
  )
}