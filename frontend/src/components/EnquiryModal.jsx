import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, User, Phone, Mail, Send, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

const EnquiryModal = ({ pet, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.fullName || '',
      mobile: user?.mobile || '',
      email: user?.email || '',
      message: `Hi, I'm interested in ${pet?.petName}. Please share more details.`
    }
  })

  const onSubmit = async (formData) => {
    setLoading(true)
    try {
      await api.post('/enquiries', { ...formData, petId: pet._id })
      toast.success('Enquiry sent successfully! The seller will contact you.')
      reset()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send enquiry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-primary-900 rounded-2xl border border-primary-800 shadow-luxury overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-800 flex items-center justify-center">
                  <MessageCircle size={18} className="text-primary-300" />
                </div>
                <div>
                  <h3 className="text-primary-50 font-bold">Enquire Now</h3>
                  <p className="text-primary-500 text-xs">{pet?.petName} — {pet?.breed}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center text-primary-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="input-label">Your Name *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" />
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="input pl-10"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className="input-label">Mobile Number *</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" />
                  <input
                    {...register('mobile', {
                      required: 'Mobile is required',
                      pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit mobile' }
                    })}
                    className="input pl-10"
                    placeholder="9876543210"
                    type="tel"
                    maxLength={10}
                  />
                </div>
                {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile.message}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="input-label">Message *</label>
                <textarea
                  {...register('message', {
                    required: 'Message is required',
                    minLength: { value: 10, message: 'Message too short' }
                  })}
                  rows={4}
                  className="input resize-none"
                  placeholder="Tell the seller what you'd like to know..."
                />
                {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={16} /> Send Enquiry</>
                )}
              </button>

              <p className="text-primary-600 text-xs text-center">
                Your contact details will be shared with the seller.
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default EnquiryModal
