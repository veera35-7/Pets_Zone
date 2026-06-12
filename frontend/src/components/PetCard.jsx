import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Calendar, Tag, User, Eye, MessageCircle, Phone } from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../lib/axios'
import toast from 'react-hot-toast'

const PetCard = ({ pet, onFavoriteToggle, isFavorited = false }) => {
  const [favorited, setFavorited] = useState(isFavorited)
  const [imgError, setImgError] = useState(false)
  const { isAuthenticated } = useAuthStore()

  const handleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please login to save favorites')
      return
    }
    try {
      const { data } = await api.post(`/favorites/${pet._id}`)
      setFavorited(data.isFavorited)
      toast.success(data.isFavorited ? 'Added to favorites' : 'Removed from favorites')
      onFavoriteToggle?.(pet._id, data.isFavorited)
    } catch {
      toast.error('Failed to update favorites')
    }
  }

  const handleWhatsApp = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const msg = encodeURIComponent(`Hi! I'm interested in your pet listing: ${pet.petName} (${pet.breed}). Listed on RV Pets Zone.`)
    const phone = pet.seller?.mobile || '91XXXXXXXXXX'
    window.open(`https://wa.me/91${phone.replace(/\D/g, '').slice(-10)}?text=${msg}`, '_blank')
  }

  const primaryImage = pet.images?.[0]?.url || '/placeholder-pet.jpg'
  const ageText = pet.age ? `${pet.age.value} ${pet.age.unit}` : 'N/A'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="card group cursor-pointer"
    >
      <Link to={`/pet/${pet._id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square">
          <img
            src={imgError ? 'https://placehold.co/400x400/171717/737373?text=No+Image' : primaryImage}
            alt={pet.petName}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              pet.availability === 'Sold Out' ? 'opacity-40 grayscale-[20%]' : ''
            }`}
            loading="lazy"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Availability Badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-md ${
              pet.availability === 'Sold Out'
                ? 'bg-red-500/90 text-white border border-red-400'
                : 'bg-emerald-500/90 text-white border border-emerald-400'
            }`}>
              {pet.availability || 'Available'}
            </span>
          </div>

          {/* Sold Out Text Overlay */}
          {pet.availability === 'Sold Out' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
              <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-red-400 rotate-[-6deg] tracking-widest uppercase shadow-luxury">
                Sold Out
              </span>
            </div>
          )}

          {/* Featured Badge */}
          {pet.featured && (
            <div className="absolute top-3 left-3">
              <span className="badge-featured">⭐ Featured</span>
            </div>
          )}

          {/* Image Count */}
          {pet.images?.length > 1 && (
            <div className="absolute top-3 right-3 flex gap-0.5">
              {[...Array(Math.min(pet.images.length, 3))].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80" />
              ))}
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-primary-950/70 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
          >
            <Heart
              size={16}
              className={favorited ? 'fill-red-500 text-red-500' : 'text-white'}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-primary-50 font-bold text-lg leading-tight">{pet.petName}</h3>
              <p className="text-primary-400 text-sm">{pet.breed}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-primary-50 font-bold text-lg">
                ₹{Number(pet.price).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-primary-500">
              <Calendar size={12} />
              <span>{ageText}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary-500">
              <Tag size={12} />
              <span>{pet.gender}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary-500 col-span-2">
              <MapPin size={12} />
              <span className="truncate">{pet.location?.city}, {pet.location?.state}</span>
            </div>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-2 pt-3 border-t border-primary-800 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary-700 flex items-center justify-center">
              <User size={12} className="text-primary-300" />
            </div>
            <span className="text-xs text-primary-400">{pet.seller?.fullName || 'Seller'}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              to={`/pet/${pet._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-800 hover:bg-primary-700 text-primary-200 text-xs font-medium rounded-lg transition-colors"
            >
              <Eye size={13} /> View Details
            </Link>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-medium rounded-lg transition-colors border border-[#25D366]/20"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default PetCard
