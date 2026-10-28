import TransactionPage from '../components/transactions/TransactionPage'

export default function Incomes() {
  return (
    <TransactionPage
      type="INCOME"
      title="Incomes"
      singularLabel="income"
    />
  )
}