import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../shared/api/auth'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-3">Admin Login</h1>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-700 mb-1">Password</label>
          <input type="password" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="px-3 py-1.5 text-sm rounded bg-gray-900 text-white disabled:opacity-50">
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  )
}