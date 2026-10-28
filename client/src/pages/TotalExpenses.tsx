import { useFinancialSummary } from '../hooks/useFinancialSummary'

export default function TotalExpenses() {
  const { totalExpenses, loading, error } = useFinancialSummary()

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h1>Total Expenses</h1>

      <h2>
        {totalExpenses} Ar
      </h2>
    </div>
  )
}