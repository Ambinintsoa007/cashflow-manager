import { useState } from 'react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  LogOut,
  Menu,
  TrendingUp,
  X,
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
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navigation = (
    <>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMenuOpen(false)}
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
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-gray-200 bg-white p-5 md:flex">
        <div className="mb-10">
          <h1 className="text-xl font-bold tracking-tight">
            Cashflow
          </h1>
          <p className="text-sm text-gray-500">
            Manager
          </p>
        </div>

        {navigation}
      </aside>

      {/* Mobile header */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <div>
          <p className="font-bold">Cashflow</p>
          <p className="text-xs text-gray-500">Manager</p>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />

          <aside className="relative flex h-full w-72 flex-col bg-white p-5 shadow-xl">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold">
                  Cashflow
                </h1>
                <p className="text-sm text-gray-500">
                  Manager
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {navigation}
          </aside>
        </div>
      )}

      {/* Page content */}
      <main className="min-h-screen md:ml-64">
        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}