import SummaryCard from '../components/summary/SummaryCard'
import { useFinancialSummary } from '../hooks/useFinancialSummary'
import { formatAmount } from '../utils/formatAmount'

export default function TotalExpenses() {
  const { totalExpenses, loading, error } = useFinancialSummary()

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <SummaryCard
      title="Total Expenses"
      amount={formatAmount(totalExpenses)}
      description="All expenses recorded since you started using Cashflow Manager."
    />
  )
}