import { useFinancialSummary } from '../hooks/useFinancialSummary'
import { formatAmount } from '../utils/formatAmount'

export default function TotalIncomes() {
  const { totalIncomes, loading, error } = useFinancialSummary()

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h1>Total Incomes</h1>

      <h2>{formatAmount(totalIncomes)}</h2>
    </div>
  )
}