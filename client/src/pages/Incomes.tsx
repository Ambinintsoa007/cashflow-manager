import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type Income = {
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

const getLocalDateTimeInputValue = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 16)
}

export default function Incomes() {
  const { user } = useAuth()

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactionAt, setTransactionAt] = useState(
    getLocalDateTimeInputValue()
  )

  const [incomes, setIncomes] = useState<Income[]>([])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const [filter, setFilter] = useState<DateFilter>('this-month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const fetchIncomes = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, description, transaction_at')
      .eq('type', 'INCOME')
      .order('transaction_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch incomes:', error.message)
      return
    }

    setIncomes(data ?? [])
  }

  useEffect(() => {
    fetchIncomes()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !amount) return

    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'INCOME',
        amount: Number(amount),
        description: description.trim() || null,
        transaction_at: new Date(transactionAt).toISOString(),
      })

    if (error) {
      console.error('Failed to add income:', error.message)
      return
    }

    setAmount('')
    setDescription('')
    setTransactionAt(getLocalDateTimeInputValue())

    await fetchIncomes()
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

  const filteredIncomes = incomes.filter((income) => {
    const date = new Date(income.transaction_at)
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

  const groupedIncomes = filteredIncomes.reduce<
    Record<string, Income[]>
  >((groups, income) => {
    const date = getDateKey(income.transaction_at)

    if (!groups[date]) {
      groups[date] = []
    }

    groups[date].push(income)

    return groups
  }, {})

  const filteredTotal = filteredIncomes.reduce(
    (total, income) => total + Number(income.amount),
    0
  )

  const startEdit = (income: Income) => {
    setEditingId(income.id)
    setEditAmount(String(income.amount))
    setEditDescription(income.description ?? '')
  }

  const updateIncome = async (id: string) => {
    if (!editAmount || Number(editAmount) <= 0) return

    const { error } = await supabase
      .from('transactions')
      .update({
        amount: Number(editAmount),
        description: editDescription.trim() || null,
      })
      .eq('id', id)

    if (error) {
      console.error('Failed to update income:', error.message)
      return
    }

    setEditingId(null)
    await fetchIncomes()
  }

  const deleteIncome = async (id: string) => {
    const confirmed = window.confirm('Delete this income?')

    if (!confirmed) return

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete income:', error.message)
      return
    }

    await fetchIncomes()
  }

  return (
    <div>
      <h1>Incomes</h1>

      {/* Add income */}
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
          Add income
        </button>
      </form>

      <hr />

      {/* Filters */}
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

      {/* Income list */}
      {filteredIncomes.length === 0 ? (
        <p>No incomes found for this period.</p>
      ) : (
        Object.entries(groupedIncomes).map(
          ([date, dailyIncomes]) => {
            const dailyTotal = dailyIncomes.reduce(
              (total, income) =>
                total + Number(income.amount),
              0
            )

            return (
              <div key={date}>
                <h2>{date}</h2>

                {dailyIncomes.map((income) => (
                  <div key={income.id}>
                    {editingId === income.id ? (
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
                            updateIncome(income.id)
                          }
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditingId(null)
                          }
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span>
                          {new Date(
                            income.transaction_at
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {' - '}

                        <strong>
                          {income.amount} Ar
                        </strong>

                        {income.description &&
                          ` - ${income.description}`}

                        {' '}

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(income)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteIncome(income.id)
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

      {/* Total for selected period */}
      <h2>
        Period total: {filteredTotal} Ar
      </h2>
    </div>
  )
}