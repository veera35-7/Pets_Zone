import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Tag, Shield, ArrowLeft, Heart, Phone, MessageCircle, Share2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import EnquiryModal from '../components/EnquiryModal'
import WhatsAppFAB from '../components/WhatsAppFAB'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import breedHistory from '../lib/breedHistory'

const PetDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [selectedImg, setSelectedImg] = useState(0)
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [favorited, setFavorited] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => api.get(`/pets/${id}`).then(r => r.data.pet)
  })

  const pet = data

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites')
      return navigate('/login')
    }
    try {
      const { data } = await api.post(`/favorites/${pet._id}`)
      setFavorited(data.isFavorited)
      toast.success(data.isFavorited ? '❤️ Added to favorites' : 'Removed from favorites')
    } catch {
      toast.error('Failed to update favorites')
    }
  }

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi! I'm interested in your pet: ${pet?.petName} (${pet?.breed}). Listed on RV Pets Zone.`)
    const phone = pet?.seller?.mobile || 'XXXXXXXXXX'
    window.open(`https://wa.me/91${phone.replace(/\D/g, '').slice(-10)}?text=${msg}`, '_blank')
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: pet?.petName, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (isLoading) return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20 page-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="shimmer rounded-2xl aspect-square" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="shimmer h-8 rounded-xl" />)}
          </div>
        </div>
      </main>
    </div>
  )

  if (error || !pet) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🐾</div>
        <h2 className="text-primary-200 text-2xl font-bold mb-2">Pet not found</h2>
        <Link to="/browse" className="btn-outline">Back to Browse</Link>
      </div>
    </div>
  )

  const vaccinationColors = {
    'Fully Vaccinated': 'badge-approved',
    'Partially Vaccinated': 'badge-pending',
    'Not Vaccinated': 'badge-rejected'
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="page-container">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
            {/* Images */}
            <div className="space-y-3">
              <motion.div
                key={selectedImg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative rounded-2xl overflow-hidden aspect-square bg-primary-900"
              >
                <img
                  src={pet.images?.[selectedImg]?.url || 'https://placehold.co/600x600/171717/737373?text=No+Image'}
                  alt={pet.petName}
                  className="w-full h-full object-cover"
                />
                {pet.availability === 'Sold Out' && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="bg-red-500 text-white font-black px-6 py-2.5 rounded-full text-base tracking-widest uppercase shadow-luxury border-2 border-red-400 rotate-[-8deg]">
                      Sold Out
                    </span>
                  </div>
                )}
                {pet.featured && (
                  <div className="absolute top-4 left-4"><span className="badge-featured">⭐ Featured</span></div>
                )}
                {/* Nav arrows */}
                {pet.images?.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImg(p => p === 0 ? pet.images.length - 1 : p - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setSelectedImg(p => p === pet.images.length - 1 ? 0 : p + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </motion.div>

              {/* Thumbnails */}
              {pet.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {pet.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        i === selectedImg ? 'border-primary-200' : 'border-primary-800'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-primary-50">{pet.petName}</h1>
                  <p className="text-primary-400 text-lg mt-1">{pet.breed} • {pet.petType}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={handleFavorite} className="w-10 h-10 rounded-full bg-primary-900 border border-primary-800 flex items-center justify-center hover:border-red-400 transition-colors">
                    <Heart size={17} className={favorited ? 'fill-red-500 text-red-500' : 'text-primary-400'} />
                  </button>
                  <button onClick={handleShare} className="w-10 h-10 rounded-full bg-primary-900 border border-primary-800 flex items-center justify-center hover:border-primary-400 transition-colors text-primary-400 hover:text-white">
                    <Share2 size={17} />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="text-4xl font-black text-primary-50">
                ₹{Number(pet.price).toLocaleString('en-IN')}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Age', value: `${pet.age?.value} ${pet.age?.unit}` },
                  { label: 'Gender', value: pet.gender },
                  { label: 'Location', value: `${pet.location?.city}, ${pet.location?.state}` },
                  { label: 'Vaccination', value: pet.vaccinationStatus },
                ].map(item => (
                  <div key={item.label} className="bg-primary-900 rounded-xl p-3 border border-primary-800">
                    <div className="text-primary-500 text-xs mb-1">{item.label}</div>
                    <div className="text-primary-100 text-sm font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Vaccination Badge */}
              <div>
                <span className={vaccinationColors[pet.vaccinationStatus] || 'badge-pending'}>
                  <Shield size={12} /> {pet.vaccinationStatus}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-primary-200 font-semibold mb-2">About This Pet</h3>
                <p className="text-primary-400 text-sm leading-relaxed">{pet.description}</p>
                <div className="mt-3 text-xs text-primary-500">
                  Issues with this listing? <a href="mailto:support@rvpetszone.com" className="text-primary-300 underline underline-offset-2">Contact Support</a>
                </div>
              </div>

              {/* Breed History / Origin Info */}
              {(() => {
                const breedInfo = breedHistory[pet.breed] || breedHistory[Object.keys(breedHistory).find(k => pet.breed.toLowerCase().includes(k.toLowerCase()))];
                if (!breedInfo) return null;
                return (
                  <div className="bg-gradient-to-r from-accent-gold/10 to-transparent border border-accent-gold/25 rounded-2xl p-5 shadow-luxury space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 rounded-full blur-xl pointer-events-none" />
                    <h4 className="text-sm font-bold text-accent-gold tracking-wider uppercase flex items-center gap-1.5">
                      📜 Breed History & Origin Info
                    </h4>
                    <div className="space-y-2.5">
                      <div>
                        <span className="text-[10px] text-primary-500 font-bold uppercase tracking-wider block">Country / Region of Origin</span>
                        <span className="text-primary-200 text-xs font-semibold">{breedInfo.origin}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-primary-500 font-bold uppercase tracking-wider block">History & Background</span>
                        <p className="text-primary-300 text-xs leading-relaxed">{breedInfo.history}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-primary-500 font-bold uppercase tracking-wider block">Breed Characteristics</span>
                        <p className="text-primary-300 text-xs leading-relaxed">{breedInfo.characteristics}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Seller Info */}
              <div className="bg-primary-900 rounded-xl p-4 border border-primary-800">
                <div className="text-primary-500 text-xs mb-3 uppercase tracking-wider">Seller</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-primary-200 font-bold">
                    {pet.seller?.fullName?.[0] || 'S'}
                  </div>
                  <div>
                    <div className="text-primary-100 font-semibold">{pet.seller?.fullName}</div>
                    <div className="text-primary-500 text-xs flex items-center gap-1">
                      <MapPin size={11} /> {pet.location?.city}, {pet.location?.state}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEnquiryOpen(true)}
                  className="btn-primary justify-center"
                >
                  <MessageCircle size={16} /> Enquire Now
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-2 py-3 px-5 bg-[#25D366] hover:bg-[#20b558] text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>
              </div>

              <div className="flex items-center gap-2 text-primary-600 text-xs">
                <Eye size={12} /> {pet.views || 0} views
              </div>
            </div>
          </div>
        </div>
      </main>

      <EnquiryModal pet={pet} isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
      <Footer />
      <WhatsAppFAB />
    </div>
  )
}

export default PetDetailPage
