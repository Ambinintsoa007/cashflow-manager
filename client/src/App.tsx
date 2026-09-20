import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Incomes from './pages/Incomes'
import Expenses from './pages/Expenses'
import TotalBenefits from './pages/TotalBenefits'
import TotalIncomes from './pages/TotalIncomes'
import TotalExpenses from './pages/TotalExpenses'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/incomes" replace />} />
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/total-benefits" element={<TotalBenefits />} />
            <Route path="/total-incomes" element={<TotalIncomes />} />
            <Route path="/total-expenses" element={<TotalExpenses />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}