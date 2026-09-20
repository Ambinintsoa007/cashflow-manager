import { supabase } from '../lib/supabase'

export default function Home() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div>
      <h1>Cashflow Manager</h1>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}
