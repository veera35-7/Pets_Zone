import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, UserX, Search, ShieldAlert, Loader2 } from 'lucide-react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.users || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleStatus = async (id, currentStatus) => {
    setActionLoadingId(id)
    try {
      const res = await api.put(`/admin/users/${id}/toggle`)
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? { ...user, isActive: res.data.isActive } : user))
      )
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    const q = search.toLowerCase()
    return (
      user.fullName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.mobile?.includes(q)
    )
  })

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-100">Registered Users</h1>
        <p className="text-primary-400 mt-1">Manage platform customer accounts and permissions.</p>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary-900/20 p-4 rounded-2xl border border-primary-900">
        <span className="text-xs font-semibold text-primary-400">
          Showing {filteredUsers.length} of {users.length} users
        </span>
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search users by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary-950/50 border border-primary-850 rounded-xl py-2.5 pl-10 pr-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={30} className="text-accent-gold animate-spin" />
          <span className="text-primary-400 text-sm">Loading users...</span>
        </div>
      ) : error ? (
        <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-primary-800 rounded-2xl bg-primary-900/10">
          <p className="text-primary-400 text-sm">No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-primary-900/40 border border-primary-800 rounded-2xl shadow-luxury">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-primary-800 text-primary-400 font-bold uppercase tracking-wider text-[10px] bg-primary-950/55">
                <th className="p-4">Full Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Registration Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-primary-850 hover:bg-primary-900/20 transition-colors">
                  <td className="p-4 font-bold text-primary-100">{user.fullName}</td>
                  <td className="p-4">
                    <div className="text-primary-200">{user.email}</div>
                    <div className="text-primary-400 text-xs mt-0.5">{user.mobile}</div>
                  </td>
                  <td className="p-4 text-primary-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      disabled={actionLoadingId === user._id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold transition-all ${
                        user.isActive
                          ? 'bg-red-500/10 hover:bg-red-500/25 text-red-400 border-red-500/20'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {actionLoadingId === user._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : user.isActive ? (
                        <>
                          <UserX size={12} />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck size={12} />
                          Reactivate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage
