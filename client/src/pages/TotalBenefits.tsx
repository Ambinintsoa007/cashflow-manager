import { useFinancialSummary } from '../hooks/useFinancialSummary'

export default function TotalBenefits() {
  const { totalBenefits, loading, error } = useFinancialSummary()

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h1>Total Benefits</h1>

      <h2>
        {totalBenefits} Ar
      </h2>
    </div>
  )
}