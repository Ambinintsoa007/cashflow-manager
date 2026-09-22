import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type Income = {
  id: string
  amount: number
  description: string | null
  transaction_at: string
}

export default function Incomes() {
  const { user } = useAuth()

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactionAt, setTransactionAt] = useState(
    new Date().toISOString().slice(0, 16)
  )

  const [incomes, setIncomes] = useState<Income[]>([])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const fetchIncomes = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, description, transaction_at')
      .eq('type', 'INCOME')
      .order('transaction_at', { ascending: false })

    if (!error) {
      setIncomes(data ?? [])
    }
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

    if (!error) {
      setAmount('')
      setDescription('')
      setTransactionAt(new Date().toISOString().slice(0, 16))

      fetchIncomes()
    }
  }

  const getDateKey = (date: string) => {
    const d = new Date(date)

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const groupedIncomes = incomes.reduce<Record<string, Income[]>>(
    (groups, income) => {
      const date = getDateKey(income.transaction_at)

      if (!groups[date]) {
        groups[date] = []
      }

      groups[date].push(income)

      return groups
    },
    {}
  )

  const startEdit = (income: Income) => {
    setEditingId(income.id)
    setEditAmount(String(income.amount))
    setEditDescription(income.description ?? '')
  }

  const updateIncome = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({
        amount: Number(editAmount),
        description: editDescription.trim() || null,
      })
      .eq('id', id)

    if (!error) {
      setEditingId(null)
      await fetchIncomes()
    }
  }

  const deleteIncome = async (id: string) => {
    const confirmed = window.confirm('Delete this income?')

    if (!confirmed) return

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (!error) {
      await fetchIncomes()
    }
  }

  return (
    <div>
      <h1>Incomes</h1>

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

        <button type="submit">Add income</button>
      </form>

      <hr />

      {Object.entries(groupedIncomes).map(([date, dailyIncomes]) => {
        const dailyTotal = dailyIncomes.reduce(
          (total, income) => total + Number(income.amount),
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
                      onChange={(e) => setEditAmount(e.target.value)}
                    />

                    <input
                      type="text"
                      value={editDescription}
                      placeholder="Description"
                      onChange={(e) => setEditDescription(e.target.value)}
                    />

                    <button onClick={() => updateIncome(income.id)}>
                      Save
                    </button>

                    <button onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span>
                      {new Date(income.transaction_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {' - '}

                    <strong>{income.amount} Ar</strong>

                    {income.description && ` - ${income.description}`}

                    {' '}

                    <button onClick={() => startEdit(income)}>
                      Edit
                    </button>

                    <button onClick={() => deleteIncome(income.id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}

            <p>
              <strong>Total: {dailyTotal} Ar</strong>
            </p>

            <hr />
          </div>
        )
      })}
    </div>
  )
}