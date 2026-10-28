import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

type TransactionType = 'INCOME' | 'EXPENSE'

type Transaction = {
  id: string
  amount: number
  description: string | null
  transaction_at: string
}

type DateFilter =
  | 'today'
  | 'this-month'
  | 'last-month'
  | 'this-year'
  | 'last-year'
  | 'all'
  | 'custom'

type Props = {
  type: TransactionType
  title: string
  singularLabel: string
}

const getLocalDateTimeInputValue = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 16)
}

export default function TransactionPage({
  type,
  title,
  singularLabel,
}: Props) {
  const { user } = useAuth()

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactionAt, setTransactionAt] = useState(
    getLocalDateTimeInputValue()
  )

  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const [filter, setFilter] = useState<DateFilter>('this-month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const fetchTransactions = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, description, transaction_at')
      .eq('type', type)
      .order('transaction_at', { ascending: false })

    if (error) {
      console.error(`Failed to fetch ${title.toLowerCase()}:`, error.message)
      return
    }

    setTransactions(data ?? [])
  }

  useEffect(() => {
    fetchTransactions()
  }, [user, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !amount || Number(amount) <= 0) return

    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type,
        amount: Number(amount),
        description: description.trim() || null,
        transaction_at: new Date(transactionAt).toISOString(),
      })

    if (error) {
      console.error(`Failed to add ${singularLabel}:`, error.message)
      return
    }

    setAmount('')
    setDescription('')
    setTransactionAt(getLocalDateTimeInputValue())

    await fetchTransactions()
  }

  const getDateKey = (date: string) => {
    const d = new Date(date)

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const parseLocalDate = (value: string) => {
    const [year, month, day] = value.split('-').map(Number)

    return new Date(year, month - 1, day)
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.transaction_at)
    const now = new Date()

    switch (filter) {
      case 'today':
        return (
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        )

      case 'this-month':
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        )

      case 'last-month': {
        const lastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        )

        return (
          date.getMonth() === lastMonth.getMonth() &&
          date.getFullYear() === lastMonth.getFullYear()
        )
      }

      case 'this-year':
        return date.getFullYear() === now.getFullYear()

      case 'last-year':
        return date.getFullYear() === now.getFullYear() - 1

      case 'custom': {
        if (!customFrom || !customTo) return true

        const from = parseLocalDate(customFrom)
        const to = parseLocalDate(customTo)

        to.setHours(23, 59, 59, 999)

        return date >= from && date <= to
      }

      case 'all':
      default:
        return true
    }
  })

  const groupedTransactions = filteredTransactions.reduce<
    Record<string, Transaction[]>
  >((groups, transaction) => {
    const date = getDateKey(transaction.transaction_at)

    if (!groups[date]) {
      groups[date] = []
    }

    groups[date].push(transaction)

    return groups
  }, {})

  const filteredTotal = filteredTransactions.reduce(
    (total, transaction) => total + Number(transaction.amount),
    0
  )

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setEditAmount(String(transaction.amount))
    setEditDescription(transaction.description ?? '')
  }

  const updateTransaction = async (id: string) => {
    if (!editAmount || Number(editAmount) <= 0) return

    const { error } = await supabase
      .from('transactions')
      .update({
        amount: Number(editAmount),
        description: editDescription.trim() || null,
      })
      .eq('id', id)

    if (error) {
      console.error(`Failed to update ${singularLabel}:`, error.message)
      return
    }

    setEditingId(null)
    await fetchTransactions()
  }

  const deleteTransaction = async (id: string) => {
    const confirmed = window.confirm(
      `Delete this ${singularLabel}?`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Failed to delete ${singularLabel}:`, error.message)
      return
    }

    await fetchTransactions()
  }

  return (
    <div>
      <h1>{title}</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="datetime-local"
          value={transactionAt}
          onChange={(e) => setTransactionAt(e.target.value)}
          required
        />

        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">
          Add {singularLabel}
        </button>
      </form>

      <hr />

      <div>
        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as DateFilter)
          }
        >
          <option value="today">Today</option>
          <option value="this-month">This month</option>
          <option value="last-month">Last month</option>
          <option value="this-year">This year</option>
          <option value="last-year">Last year</option>
          <option value="all">All time</option>
          <option value="custom">Custom</option>
        </select>

        {filter === 'custom' && (
          <>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />

            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </>
        )}
      </div>

      <hr />

      {filteredTransactions.length === 0 ? (
        <p>No {title.toLowerCase()} found for this period.</p>
      ) : (
        Object.entries(groupedTransactions).map(
          ([date, dailyTransactions]) => {
            const dailyTotal = dailyTransactions.reduce(
              (total, transaction) =>
                total + Number(transaction.amount),
              0
            )

            return (
              <div key={date}>
                <h2>{date}</h2>

                {dailyTransactions.map((transaction) => (
                  <div key={transaction.id}>
                    {editingId === transaction.id ? (
                      <>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) =>
                            setEditAmount(e.target.value)
                          }
                        />

                        <input
                          type="text"
                          value={editDescription}
                          placeholder="Description"
                          onChange={(e) =>
                            setEditDescription(e.target.value)
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            updateTransaction(transaction.id)
                          }
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span>
                          {new Date(
                            transaction.transaction_at
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {' - '}

                        <strong>
                          {transaction.amount} Ar
                        </strong>

                        {transaction.description &&
                          ` - ${transaction.description}`}

                        {' '}

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(transaction)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteTransaction(transaction.id)
                          }
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                ))}

                <p>
                  <strong>
                    Daily total: {dailyTotal} Ar
                  </strong>
                </p>

                <hr />
              </div>
            )
          }
        )
      )}

      <h2>
        Period total: {filteredTotal} Ar
      </h2>
    </div>
  )
}