import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Trash2, Plus, AlertCircle, Info, Calendar, MapPin, Loader2 } from 'lucide-react'
import api from '../../lib/axios'
import StatusBadge from '../../components/StatusBadge'
import toast from 'react-hot-toast'

const MyListingsPage = () => {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchMyPets = async () => {
    try {
      const res = await api.get('/pets/my')
      setPets(res.data.pets || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your listings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyPets()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      await api.delete(`/pets/${deleteId}`)
      setPets((prev) => prev.filter((p) => p._id !== deleteId))
      setDeleteId(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const toggleAvailability = async (petId, currentAvailability) => {
    const nextAvailability = currentAvailability === 'Sold Out' ? 'Available' : 'Sold Out'
    try {
      const { data } = await api.put(`/pets/${petId}`, { availability: nextAvailability })
      if (data.success) {
        setPets((prev) => prev.map((p) => p._id === petId ? { ...p, availability: nextAvailability } : p))
        toast.success(`Listing marked as ${nextAvailability}!`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability.')
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-100">My Pet Listings</h1>
          <p className="text-primary-400 mt-1">Manage and track your submitted pet listings.</p>
        </div>
        <Link
          to="/dashboard/add-pet"
          className="flex items-center gap-2 bg-primary-100 hover:bg-white text-primary-950 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
        >
          <Plus size={16} />
          Add New Pet
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={30} className="text-primary-400 animate-spin" />
          <span className="text-primary-400 text-sm">Loading listings...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/20 border border-red-900/50 p-4 rounded-2xl">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-primary-800 rounded-2xl bg-primary-900/10">
          <Info size={40} className="mx-auto text-primary-500 mb-4" />
          <h3 className="text-xl font-bold text-primary-200">No Listings Yet</h3>
          <p className="text-primary-400 text-sm mt-1 mb-6">Create your first listing to start finding potential buyers.</p>
          <Link
            to="/dashboard/add-pet"
            className="inline-flex items-center gap-2 bg-primary-800 hover:bg-primary-700 text-primary-100 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border border-primary-700"
          >
            <Plus size={16} />
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <motion.div
              key={pet._id}
              layout
              className="bg-primary-900/40 backdrop-blur-md border border-primary-800/80 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-primary-700 transition-all duration-300"
            >
              {/* Pet Image */}
              <div className="relative aspect-[4/3] bg-primary-950 overflow-hidden">
                <img
                  src={pet.images?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600'}
                  alt={pet.petName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={pet.status} />
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-bold text-primary-100 truncate">{pet.petName}</h3>
                    <span className="text-accent-gold font-bold">₹{pet.price?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-primary-400 mt-1">{pet.breed} • {pet.petType}</p>

                  <div className="flex flex-wrap gap-y-2 gap-x-4 mt-4 text-xs text-primary-400 border-t border-primary-800/60 pt-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-primary-500" />
                      <span>{pet.location?.city || ''}, {pet.location?.state || ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-primary-500" />
                      <span>{pet.age ? `${pet.age.value} ${pet.age.unit}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Rejection notice */}
                {pet.status === 'rejected' && pet.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex items-start gap-2 text-xs text-red-400">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Rejection Reason:</span>
                      {pet.rejectionReason}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-primary-800/60">
                  {pet.status === 'approved' ? (
                    <>
                      <Link
                        to={`/pet/${pet._id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-primary-800 hover:bg-primary-700 text-primary-100 py-2.5 rounded-xl text-xs font-semibold transition-all"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                      <button
                        onClick={() => toggleAvailability(pet._id, pet.availability)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                          pet.availability === 'Sold Out'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        {pet.availability === 'Sold Out' ? 'Make Available' : 'Mark Sold'}
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary-950 text-primary-500 py-2.5 rounded-xl text-xs font-semibold cursor-not-allowed border border-primary-900"
                    >
                      Under Review
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteId(pet._id)}
                    className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all"
                    title="Delete Listing"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
              <h3 className="text-xl font-bold text-primary-100">Delete Listing?</h3>
              <p className="text-primary-400 text-sm mt-2">
                Are you sure you want to delete this pet listing? This action is permanent and cannot be undone.
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

export default MyListingsPage
