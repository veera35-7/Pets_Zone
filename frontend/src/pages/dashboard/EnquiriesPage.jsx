import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Phone, Mail, Calendar, User, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import api from '../../lib/axios'

const EnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/enquiries/my')
      setEnquiries(res.data.enquiries || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch enquiries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const handleWhatsApp = (enquiry) => {
    const petName = enquiry.pet?.petName || 'your pet'
    const msg = encodeURIComponent(`Hi ${enquiry.name}! I received your enquiry about my pet listing "${petName}" on RV Pets Zone.`)
    const phone = enquiry.mobile.replace(/\D/g, '')
    // Ensure +91 prefix for India numbers if not already present
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, '_blank')
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-100">Buyer Enquiries</h1>
        <p className="text-primary-400 mt-1">Manage inquiries from potential buyers interested in your pets.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={30} className="text-primary-400 animate-spin" />
          <span className="text-primary-400 text-sm">Loading enquiries...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/20 border border-red-900/50 p-4 rounded-2xl">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-primary-800 rounded-2xl bg-primary-900/10">
          <MessageSquare size={40} className="mx-auto text-primary-500 mb-4" />
          <h3 className="text-xl font-bold text-primary-200">No Enquiries Yet</h3>
          <p className="text-primary-400 text-sm mt-1">When buyers contact you, their messages will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry, index) => (
            <motion.div
              key={enquiry._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-primary-900/40 backdrop-blur-md border border-primary-800/80 rounded-2xl p-6 shadow-luxury flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-primary-700 transition-colors"
            >
              {/* Pet Info & Buyer Message */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  {enquiry.pet?.images?.[0]?.url ? (
                    <img
                      src={enquiry.pet.images[0].url}
                      alt={enquiry.pet?.petName}
                      className="w-12 h-12 rounded-xl object-cover border border-primary-800"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary-800 flex items-center justify-center text-xs font-bold text-primary-300">
                      Pet
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent-gold">
                      Enquiry for:
                    </span>
                    <Link
                      to={`/pet/${enquiry.pet?._id}`}
                      className="text-primary-100 font-bold hover:underline flex items-center gap-1 text-sm md:text-base"
                    >
                      {enquiry.pet?.petName || 'Deleted Listing'}
                      <ExternalLink size={12} className="text-primary-500" />
                    </Link>
                  </div>
                </div>

                <div className="bg-primary-950/40 border border-primary-800/40 rounded-xl p-4">
                  <p className="text-primary-200 text-sm italic">"{enquiry.message}"</p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-primary-400">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-primary-500" />
                    <span className="font-medium text-primary-300">{enquiry.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={13} className="text-primary-500" />
                    <span>{enquiry.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary-500" />
                    <span>{new Date(enquiry.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full md:w-auto flex md:flex-col sm:flex-row gap-2 shrink-0 border-t border-primary-800/50 pt-4 md:pt-0 md:border-t-0">
                <button
                  onClick={() => handleWhatsApp(enquiry)}
                  className="flex-1 md:w-44 flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] py-3 rounded-xl text-xs font-bold transition-all border border-[#25D366]/20"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp Buyer
                </button>
                <a
                  href={`tel:${enquiry.mobile}`}
                  className="flex-1 md:w-44 flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-700 text-primary-200 py-3 rounded-xl text-xs font-bold transition-all border border-primary-700"
                >
                  <Phone size={14} />
                  Call Buyer
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EnquiriesPage
