import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Check, X, Star, Trash2, Edit, Search, AlertTriangle, Loader2 } from 'lucide-react'
import api from '../../lib/axios'
import StatusBadge from '../../components/StatusBadge'
import toast from 'react-hot-toast'

const AdminPetsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentStatus = searchParams.get('status') || 'all'

  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Reject Modal state
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)

  // Delete Modal state
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchPets = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/admin/pets`, {
        params: {
          status: currentStatus === 'all' ? undefined : currentStatus,
          search: search || undefined
        }
      })
      setPets(res.data.pets || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pets list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPets()
  }, [currentStatus, search])

  const handleApprove = async (id) => {
    try {
      const res = await api.put(`/admin/pets/${id}/approve`)
      setPets((prev) => prev.map((p) => (p._id === id ? res.data.pet : p)))
      toast.success('Listing approved and published')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve listing.')
    }
  }

  const handleReject = async () => {
    if (!rejectId) return
    setRejectLoading(true)
    try {
      const res = await api.put(`/admin/pets/${rejectId}/reject`, { reason: rejectReason })
      setPets((prev) => prev.map((p) => (p._id === rejectId ? res.data.pet : p)))
      toast.success('Listing rejected')
      setRejectId(null)
      setRejectReason('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject listing.')
    } finally {
      setRejectLoading(false)
    }
  }

  const handleToggleFeature = async (id) => {
    try {
      const res = await api.put(`/admin/pets/${id}/feature`)
      setPets((prev) => prev.map((p) => (p._id === id ? { ...p, featured: res.data.featured } : p)))
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update feature status.')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      await api.delete(`/admin/pets/${deleteId}`)
      setPets((prev) => prev.filter((p) => p._id !== deleteId))
      toast.success('Listing deleted permanently')
      setDeleteId(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleFilterChange = (statusVal) => {
    setSearchParams({ status: statusVal })
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-100">Pet Listings</h1>
        <p className="text-primary-400 mt-1">Approve, reject, feature, edit, or delete platform listings.</p>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary-900/20 p-4 rounded-2xl border border-primary-900">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => handleFilterChange(st)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200 ${
                currentStatus === st
                  ? 'bg-accent-gold text-primary-950 shadow-glow'
                  : 'text-primary-400 hover:text-primary-100 hover:bg-primary-900/60 border border-primary-800'
              }`}
            >
              {st === 'all' ? 'All' : st === 'pending' ? 'Pending Review' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary-950/50 border border-primary-850 rounded-xl py-2.5 pl-10 pr-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-xs"
          />
        </div>
      </div>

      {/* Listings list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={30} className="text-accent-gold animate-spin" />
          <span className="text-primary-400 text-sm">Loading listings...</span>
        </div>
      ) : error ? (
        <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-primary-800 rounded-2xl bg-primary-900/10">
          <p className="text-primary-400 text-sm">No listings found matching this status.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-primary-900/40 border border-primary-800 rounded-2xl shadow-luxury">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-primary-800 text-primary-400 font-bold uppercase tracking-wider text-[10px] bg-primary-950/55">
                <th className="p-4">Pet Info</th>
                <th className="p-4">Seller Details</th>
                <th className="p-4">Location</th>
                <th className="p-4">Price</th>
                <th className="p-4">Review Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet._id} className="border-b border-primary-850 hover:bg-primary-900/20 transition-colors">
                  {/* Pet Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={pet.images?.[0]?.url || 'https://placehold.co/100'}
                        alt={pet.petName}
                        className="w-12 h-12 rounded-xl object-cover border border-primary-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-primary-100 font-bold flex items-center gap-1.5">
                          {pet.petName}
                          {pet.featured && <span className="text-[10px] text-accent-gold">⭐</span>}
                        </div>
                        <div className="text-primary-400 text-xs truncate">{pet.breed} • {pet.petType}</div>
                      </div>
                    </div>
                  </td>

                  {/* Seller Details */}
                  <td className="p-4">
                    <div className="text-primary-200 font-semibold">{pet.seller?.fullName || 'N/A'}</div>
                    <div className="text-primary-400 text-xs mt-0.5">{pet.seller?.email || 'N/A'}</div>
                  </td>

                  {/* Location */}
                  <td className="p-4 text-primary-300">
                    {pet.location?.city}, {pet.location?.state}
                  </td>

                  {/* Price */}
                  <td className="p-4 text-accent-gold font-bold">
                    ₹{pet.price?.toLocaleString()}
                  </td>

                  {/* Review Status */}
                  <td className="p-4">
                    <StatusBadge status={pet.status} />
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-1.5">
                      {/* Feature action */}
                      {pet.status === 'approved' && (
                        <button
                          onClick={() => handleToggleFeature(pet._id)}
                          className={`p-2 rounded-xl border transition-colors ${
                            pet.featured
                              ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/30 hover:bg-accent-gold/25'
                              : 'text-primary-400 border-primary-800 hover:bg-primary-800 hover:text-primary-100'
                          }`}
                          title={pet.featured ? 'Unfeature listing' : 'Feature listing'}
                        >
                          <Star size={14} className={pet.featured ? 'fill-current' : ''} />
                        </button>
                      )}

                      {/* Approval triggers */}
                      {pet.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(pet._id)}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl transition-all"
                            title="Approve Listing"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setRejectId(pet._id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all"
                            title="Reject Listing"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}

                      {/* Edit */}
                      <Link
                        to={`/admin/pets/${pet._id}/edit`}
                        className="p-2 text-primary-400 hover:text-primary-100 bg-primary-800/40 hover:bg-primary-800 border border-primary-800 rounded-xl transition-all"
                        title="Edit Listing"
                      >
                        <Edit size={14} />
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteId(pet._id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-all"
                        title="Delete Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-primary-900 border border-primary-800 rounded-2xl max-w-md w-full p-6 shadow-luxury"
            >
              <h3 className="text-xl font-bold text-primary-100 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" />
                Reject Pet Listing
              </h3>
              <p className="text-primary-400 text-sm mt-2">
                Please provide the reason why this pet listing did not meet listing standards. This reason will be shown to the seller.
              </p>
              <textarea
                rows="4"
                placeholder="e.g. Photo quality is too low or info seems incorrect..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-primary-950 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm mt-4 resize-none"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setRejectId(null); setRejectReason('') }}
                  disabled={rejectLoading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-primary-400 hover:text-primary-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejectLoading || !rejectReason.trim()}
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {rejectLoading ? <Loader2 size={14} className="animate-spin" /> : 'Reject Listing'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-primary-900 border border-primary-800 rounded-2xl max-w-md w-full p-6 shadow-luxury"
            >
              <h3 className="text-xl font-bold text-primary-100">Permanent Delete?</h3>
              <p className="text-primary-400 text-sm mt-2">
                Are you sure you want to delete this listing from the database? This cannot be undone.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-primary-400 hover:text-primary-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all"
                >
                  {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : 'Delete Listing'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminPetsPage
