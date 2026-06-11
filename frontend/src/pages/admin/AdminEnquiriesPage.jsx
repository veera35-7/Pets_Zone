import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Calendar, User, ExternalLink, Mail, Phone, Loader2 } from 'lucide-react'
import api from '../../lib/axios'

const AdminEnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/admin/enquiries')
      setEnquiries(res.data.enquiries || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch all enquiries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [])

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-100">All Platform Enquiries</h1>
        <p className="text-primary-400 mt-1">Review enquiries sent between buyers and sellers.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={30} className="text-accent-gold animate-spin" />
          <span className="text-primary-400 text-sm">Loading enquiries...</span>
        </div>
      ) : error ? (
        <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-2xl text-red-400 text-sm">
          {error}
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-primary-800 rounded-2xl bg-primary-900/10">
          <MessageSquare size={40} className="mx-auto text-primary-500 mb-4" />
          <p className="text-primary-400 text-sm">No enquiries found on the platform.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {enquiries.map((enquiry, index) => (
            <motion.div
              key={enquiry._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-primary-900/40 backdrop-blur-md border border-primary-800 rounded-2xl p-6 shadow-luxury hover:border-primary-700 transition-colors"
            >
              {/* Pet Info header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-primary-800/60 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={enquiry.pet?.images?.[0]?.url || 'https://placehold.co/100'}
                    alt={enquiry.pet?.petName}
                    className="w-12 h-12 rounded-xl object-cover border border-primary-800"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest block">Pet Listing</span>
                    <Link
                      to={`/pet/${enquiry.pet?._id}`}
                      className="text-primary-100 font-bold hover:underline flex items-center gap-1.5 text-sm md:text-base"
                    >
                      {enquiry.pet?.petName || 'Deleted Listing'}
                      <ExternalLink size={12} className="text-primary-500" />
                    </Link>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest block">Seller</span>
                  <div className="text-primary-300 font-semibold text-xs md:text-sm">{enquiry.seller?.fullName || 'N/A'}</div>
                  <div className="text-primary-500 text-[11px]">{enquiry.seller?.email || 'N/A'} • {enquiry.seller?.mobile || 'N/A'}</div>
                </div>
              </div>

              {/* Message content */}
              <div className="py-4">
                <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest block mb-2">Buyer Enquiry Message</span>
                <div className="bg-primary-950/40 border border-primary-800/40 rounded-xl p-4">
                  <p className="text-primary-200 text-xs md:text-sm italic">"{enquiry.message}"</p>
                </div>
              </div>

              {/* Footer details */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-primary-800/60 pt-4 gap-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-primary-400">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-primary-500" />
                    <span className="font-semibold text-primary-200">{enquiry.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={13} className="text-primary-500" />
                    <span>{enquiry.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-primary-500" />
                    <span>{enquiry.mobile}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary-500" />
                    <span>{new Date(enquiry.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <a
                    href={`https://wa.me/${enquiry.mobile.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-semibold rounded-xl border border-[#25D366]/20 transition-all"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${enquiry.mobile}`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-800 hover:bg-primary-700 text-primary-250 text-xs font-semibold rounded-xl border border-primary-750 transition-all"
                  >
                    Call
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminEnquiriesPage
