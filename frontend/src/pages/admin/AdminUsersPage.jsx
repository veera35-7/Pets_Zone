import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, UserX, Search, ShieldAlert, Loader2, ShieldCheck, XCircle, FileText, Check } from 'lucide-react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [pendingSellers, setPendingSellers] = useState([])
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'verifications'
  const [loading, setLoading] = useState(true)
  const [verificationsLoading, setVerificationsLoading] = useState(false)
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

  const fetchPendingSellers = async () => {
    setVerificationsLoading(true)
    try {
      const res = await api.get('/admin/sellers/pending')
      setPendingSellers(res.data.users || [])
    } catch (err) {
      console.error('Failed to load pending verifications', err)
    } finally {
      setVerificationsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchPendingSellers()
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

  const handleVerifySeller = async (id, status) => {
    setActionLoadingId(id)
    try {
      const res = await api.put(`/admin/sellers/${id}/verify`, { status })
      toast.success(res.data.message)
      // Remove from pending list
      setPendingSellers((prev) => prev.filter((u) => u._id !== id))
      // Refresh user lists
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify seller.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    const q = search.toLowerCase()
    return (
      user.fullName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.mobile?.includes(q) ||
      user.role?.toLowerCase().includes(q)
    )
  })

  const filteredPending = pendingSellers.filter((user) => {
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
        <h1 className="text-3xl font-bold tracking-tight text-primary-100">User Management</h1>
        <p className="text-primary-400 mt-1">Manage platform customer accounts, seller verifications, and permissions.</p>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-primary-850 gap-6 mb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-xs font-semibold tracking-wider transition-colors ${
            activeTab === 'all' ? 'border-b-2 border-primary-100 text-primary-100' : 'text-primary-500 hover:text-primary-300'
          }`}
        >
          ALL USERS
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 text-xs font-semibold tracking-wider transition-colors relative ${
            activeTab === 'verifications' ? 'border-b-2 border-primary-100 text-primary-100' : 'text-primary-500 hover:text-primary-300'
          }`}
        >
          VERIFICATION REQUESTS
          {pendingSellers.length > 0 && (
            <span className="absolute -top-1.5 -right-3.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-gold text-[9px] font-bold text-primary-950">
              {pendingSellers.length}
            </span>
          )}
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary-900/20 p-4 rounded-2xl border border-primary-900">
        <span className="text-xs font-semibold text-primary-400">
          {activeTab === 'all' 
            ? `Showing ${filteredUsers.length} of ${users.length} users`
            : `Showing ${filteredPending.length} of ${pendingSellers.length} pending requests`
          }
        </span>
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary-950/50 border border-primary-850 rounded-xl py-2.5 pl-10 pr-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-xs"
          />
        </div>
      </div>

      {activeTab === 'all' ? (
        /* ALL USERS TAB */
        loading ? (
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
                  <th className="p-4">Role</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-primary-850 hover:bg-primary-900/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-primary-100 flex items-center gap-1.5">
                        {user.fullName}
                        {user.isVerifiedSeller && (
                          <span className="inline-flex items-center text-emerald-400" title="Verified Seller">
                            <ShieldCheck size={14} />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-primary-500 mt-0.5">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-primary-200">{user.email}</div>
                      <div className="text-primary-400 text-xs mt-0.5">{user.mobile}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-primary-800 text-primary-300 font-medium capitalize text-[10px] border border-primary-750">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 capitalize text-xs">
                      {user.aadhaarStatus === 'approved' ? (
                        <span className="text-emerald-400 font-semibold">Approved</span>
                      ) : user.aadhaarStatus === 'pending' ? (
                        <span className="text-amber-400 font-semibold">Pending Review</span>
                      ) : user.aadhaarStatus === 'rejected' ? (
                        <span className="text-red-400">Rejected</span>
                      ) : (
                        <span className="text-primary-500">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
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
        )
      ) : verificationsLoading ? (
        /* VERIFICATION REQUESTS TAB - LOADING */
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={30} className="text-accent-gold animate-spin" />
          <span className="text-primary-400 text-sm">Loading requests...</span>
        </div>
      ) : filteredPending.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-primary-800 rounded-2xl bg-primary-900/10">
          <p className="text-primary-400 text-sm">No pending verification requests.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-primary-900/40 border border-primary-800 rounded-2xl shadow-luxury">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-primary-800 text-primary-400 font-bold uppercase tracking-wider text-[10px] bg-primary-950/55">
                <th className="p-4">Applicant</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Aadhaar Document</th>
                <th className="p-4">Submission Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPending.map((user) => (
                <tr key={user._id} className="border-b border-primary-850 hover:bg-primary-900/20 transition-colors">
                  <td className="p-4 font-bold text-primary-100">{user.fullName}</td>
                  <td className="p-4">
                    <div className="text-primary-200">{user.email}</div>
                    <div className="text-primary-400 text-xs mt-0.5">{user.mobile}</div>
                  </td>
                  <td className="p-4">
                    {user.aadhaarUrl ? (
                      <a
                        href={user.aadhaarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-accent-gold hover:underline font-semibold"
                      >
                        <FileText size={14} /> View Document
                      </a>
                    ) : (
                      <span className="text-primary-600">No document</span>
                    )}
                  </td>
                  <td className="p-4 text-primary-300">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleVerifySeller(user._id, 'approved')}
                      disabled={actionLoadingId === user._id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold transition-all"
                    >
                      {actionLoadingId === user._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={12} /> Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleVerifySeller(user._id, 'rejected')}
                      disabled={actionLoadingId === user._id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-all"
                    >
                      {actionLoadingId === user._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          <XCircle size={12} /> Reject
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
