import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AppLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r p-6">
        <h1 className="text-xl font-bold mb-8">
          Cashflow Manager
        </h1>

        <nav className="flex flex-col gap-3">
          <NavLink to="/incomes">Incomes</NavLink>
          <NavLink to="/expenses">Expenses</NavLink>
          <NavLink to="/total-benefits">Total Benefits</NavLink>
          <NavLink to="/total-incomes">Total Incomes</NavLink>
          <NavLink to="/total-expenses">Total Expenses</NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-8"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
