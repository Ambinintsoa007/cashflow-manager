import { useEffect, useState } from 'react'
import {
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { formatAmount } from '../../utils/formatAmount'

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

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMessage('')

    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, description, transaction_at')
      .eq('type', type)
      .order('transaction_at', { ascending: false })

    if (error) {
      setErrorMessage(`Unable to load ${title.toLowerCase()}.`)
      setLoading(false)
      return
    }

    setTransactions(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [user, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !amount || Number(amount) <= 0) return

    setIsAdding(true)
    setErrorMessage('')

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
      setErrorMessage(`Unable to add ${singularLabel}.`)
      setIsAdding(false)
      return
    }

    setAmount('')
    setDescription('')
    setTransactionAt(getLocalDateTimeInputValue())

    await fetchTransactions()
    setIsAdding(false)
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
    setErrorMessage('')
  }

  const updateTransaction = async (id: string) => {
    if (!editAmount || Number(editAmount) <= 0) return

    setSavingId(id)
    setErrorMessage('')

    const { error } = await supabase
      .from('transactions')
      .update({
        amount: Number(editAmount),
        description: editDescription.trim() || null,
      })
      .eq('id', id)

    if (error) {
      setErrorMessage(`Unable to update ${singularLabel}.`)
      setSavingId(null)
      return
    }

    setEditingId(null)
    await fetchTransactions()
    setSavingId(null)
  }

  const deleteTransaction = async (id: string) => {
    const confirmed = window.confirm(
      `Delete this ${singularLabel}?`
    )

    if (!confirmed) return

    setDeletingId(id)
    setErrorMessage('')

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      setErrorMessage(`Unable to delete ${singularLabel}.`)
      setDeletingId(null)
      return
    }

    await fetchTransactions()
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage and track your {title.toLowerCase()}.
        </p>
      </div>

      {/* Add transaction */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} />

          <h2 className="font-semibold text-gray-900">
            Add {singularLabel}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date & time
            </label>

            <input
              type="datetime-local"
              value={transactionAt}
              onChange={(e) => setTransactionAt(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>

            <input
              type="text"
              placeholder="Optional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-gray-500"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={isAdding}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />

              {isAdding
                ? 'Adding...'
                : `Add ${singularLabel}`}
            </button>
          </div>
        </form>
      </section>

      {/* Filters */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Period
            </label>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as DateFilter)
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="today">Today</option>
              <option value="this-month">This month</option>
              <option value="last-month">Last month</option>
              <option value="this-year">This year</option>
              <option value="last-year">Last year</option>
              <option value="all">All time</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {filter === 'custom' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  From
                </label>

                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  To
                </label>

                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Error */}
      {errorMessage && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* Period total */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">
          Period total
        </p>

        <p className="mt-1 text-2xl font-bold text-gray-900">
          {formatAmount(filteredTotal)}
        </p>
      </section>

      {/* Loading */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading transactions...
        </div>
      ) : filteredTransactions.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <CalendarDays
            size={32}
            className="mx-auto mb-3 text-gray-400"
          />

          <p className="font-medium text-gray-700">
            No {title.toLowerCase()} found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            No transaction exists for this period.
          </p>
        </div>
      ) : (
        /* Transactions */
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(
            ([date, dailyTransactions]) => {
              const dailyTotal = dailyTransactions.reduce(
                (total, transaction) =>
                  total + Number(transaction.amount),
                0
              )

              return (
                <section
                  key={date}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* Day header */}
                  <div className="flex flex-col gap-1 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="font-semibold text-gray-900">
                      {date}
                    </h2>

                    <span className="text-sm font-medium text-gray-600">
                      {formatAmount(dailyTotal)}
                    </span>
                  </div>

                  {/* Daily transactions */}
                  <div className="divide-y divide-gray-100">
                    {dailyTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        {editingId === transaction.id ? (
                          <div className="grid w-full gap-3 sm:grid-cols-[160px_1fr_auto]">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={editAmount}
                              onChange={(e) =>
                                setEditAmount(e.target.value)
                              }
                              className="rounded-lg border border-gray-300 px-3 py-2"
                            />

                            <input
                              type="text"
                              value={editDescription}
                              placeholder="Description"
                              onChange={(e) =>
                                setEditDescription(e.target.value)
                              }
                              className="rounded-lg border border-gray-300 px-3 py-2"
                            />

                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={savingId === transaction.id}
                                onClick={() =>
                                  updateTransaction(transaction.id)
                                }
                                className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {savingId === transaction.id
                                  ? 'Saving...'
                                  : 'Save'}
                              </button>

                              <button
                                type="button"
                                disabled={savingId === transaction.id}
                                onClick={() => setEditingId(null)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {new Date(
                                    transaction.transaction_at
                                  ).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>

                                <strong className="text-gray-900">
                                  {formatAmount(
                                    Number(transaction.amount)
                                  )}
                                </strong>
                              </div>

                              {transaction.description && (
                                <p className="mt-1 break-words text-sm text-gray-500">
                                  {transaction.description}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={
                                  deletingId === transaction.id
                                }
                                onClick={() =>
                                  startEdit(transaction)
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                              >
                                <Pencil size={15} />
                                Edit
                              </button>

                              <button
                                type="button"
                                disabled={
                                  deletingId === transaction.id
                                }
                                onClick={() =>
                                  deleteTransaction(transaction.id)
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 size={15} />

                                {deletingId === transaction.id
                                  ? 'Deleting...'
                                  : 'Delete'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}