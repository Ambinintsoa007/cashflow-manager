import SummaryCard from '../components/summary/SummaryCard'
import { useFinancialSummary } from '../hooks/useFinancialSummary'
import { formatAmount } from '../utils/formatAmount'

export default function TotalBenefits() {
  const { totalBenefits, loading, error } = useFinancialSummary()

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <SummaryCard
      title="Total Benefits"
      amount={formatAmount(totalBenefits)}
      description="Your total incomes minus your total expenses."
    />
  )
}