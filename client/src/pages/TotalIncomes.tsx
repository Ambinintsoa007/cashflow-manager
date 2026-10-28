import SummaryCard from '../components/summary/SummaryCard'
import { useFinancialSummary } from '../hooks/useFinancialSummary'
import { formatAmount } from '../utils/formatAmount'

export default function TotalIncomes() {
  const { totalIncomes, loading, error } = useFinancialSummary()

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <SummaryCard
      title="Total Incomes"
      amount={formatAmount(totalIncomes)}
      description="All income recorded since you started using Cashflow Manager."
    />
  )
}