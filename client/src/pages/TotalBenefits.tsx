import { useFinancialSummary } from '../hooks/useFinancialSummary'
import { formatAmount } from '../utils/formatAmount'

export default function TotalBenefits() {
  const { totalBenefits, loading, error } = useFinancialSummary()

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h1>Total Benefits</h1>

      <h2>{formatAmount(totalBenefits)}</h2>
    </div>
  )
}