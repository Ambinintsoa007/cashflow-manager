import {
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  LogOut,
  TrendingUp,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const links = [
  { to: '/incomes', label: 'Incomes', icon: ArrowUpCircle },
  { to: '/expenses', label: 'Expenses', icon: ArrowDownCircle },
  { to: '/total-benefits', label: 'Total Benefits', icon: TrendingUp },
  { to: '/total-incomes', label: 'Total Incomes', icon: BarChart3 },
  { to: '/total-expenses', label: 'Total Expenses', icon: BarChart3 },
]

export default function AppLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white p-5">
        <div className="mb-10">
          <h1 className="text-xl font-bold">Cashflow</h1>
          <p className="text-sm text-gray-500">Manager</p>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="ml-64 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  )
}