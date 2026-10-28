import { useFinancialSummary } from '../hooks/useFinancialSummary'

export default function TotalIncomes() {
  const { totalIncomes, loading, error } = useFinancialSummary()

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h1>Total Incomes</h1>

      <h2>
        {totalIncomes} Ar
      </h2>
    </div>
  )
}