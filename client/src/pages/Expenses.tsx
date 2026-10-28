import TransactionPage from '../components/transactions/TransactionPage'

export default function Expenses() {
  return (
    <TransactionPage
      type="EXPENSE"
      title="Expenses"
      singularLabel="expense"
    />
  )
}