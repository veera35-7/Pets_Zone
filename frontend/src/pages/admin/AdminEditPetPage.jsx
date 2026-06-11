import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Save, ArrowLeft, Loader2, Sparkles, MapPin, FileText } from 'lucide-react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

const AdminEditPetPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pet, setPet] = useState(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await api.get(`/pets/${id}`)
        const petData = res.data.pet
        setPet(petData)
        
        // Seed form fields
        setValue('petName', petData.petName)
        setValue('petType', petData.petType)
        setValue('breed', petData.breed)
        setValue('gender', petData.gender)
        setValue('ageValue', petData.age?.value || '')
        setValue('ageUnit', petData.age?.unit || 'Months')
        setValue('price', petData.price)
        setValue('vaccinationStatus', petData.vaccinationStatus)
        setValue('description', petData.description)
        setValue('city', petData.location?.city || '')
        setValue('state', petData.location?.state || '')
        setValue('pincode', petData.location?.pincode || '')
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch pet details.')
        navigate('/admin/pets')
      } finally {
        setLoading(false)
      }
    }

    fetchPet()
  }, [id, setValue, navigate])

  const onSubmit = async (data) => {
    setSubmitting(true)
    
    // Format payload
    const payload = {
      petName: data.petName,
      petType: data.petType,
      breed: data.breed,
      gender: data.gender,
      age: {
        value: Number(data.ageValue),
        unit: data.ageUnit
      },
      price: Number(data.price),
      vaccinationStatus: data.vaccinationStatus,
      description: data.description,
      location: {
        city: data.city,
        state: data.state,
        pincode: data.pincode
      }
    }

    try {
      await api.put(`/admin/pets/${id}`, payload)
      toast.success('Pet listing updated successfully')
      navigate('/admin/pets')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update pet listing.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 size={36} className="text-accent-gold animate-spin" />
        <span className="text-primary-400 text-sm">Loading pet details...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/pets"
          className="p-2 bg-primary-900 border border-primary-800 rounded-xl text-primary-400 hover:text-primary-100 hover:bg-primary-800 transition-all"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-100">Edit Listing</h1>
          <p className="text-primary-400 mt-1">Modify info for listing "{pet?.petName}".</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Images Preview column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-primary-900/50 backdrop-blur-md border border-primary-800/80 rounded-2xl p-6 shadow-luxury">
            <h3 className="text-base font-bold text-primary-100 mb-4">Listing Images</h3>
            <div className="grid grid-cols-2 gap-2">
              {pet?.images?.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-primary-950 border border-primary-850 relative">
                  <img src={img.url} alt="Pet" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-accent-gold text-primary-950 text-[9px] font-bold rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Details column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-primary-900/50 backdrop-blur-md border border-primary-800/80 rounded-2xl p-6 shadow-luxury">
            <h3 className="text-lg font-bold text-primary-100 flex items-center gap-2 mb-6 border-b border-primary-800/60 pb-3">
              <FileText size={18} className="text-primary-400" />
              Pet Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pet Name */}
              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Pet Name</label>
                <input
                  type="text"
                  {...register('petName', { required: 'Pet Name is required' })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
                {errors.petName && <span className="text-xs text-red-400 mt-1 block">{errors.petName.message}</span>}
              </div>

              {/* Pet Type */}
              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Pet Type</label>
                <select
                  {...register('petType')}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Fish">Fish</option>
                  <option value="Cow">Cow</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Breed */}
              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Breed</label>
                <input
                  type="text"
                  {...register('breed', { required: 'Breed is required' })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
                {errors.breed && <span className="text-xs text-red-400 mt-1 block">{errors.breed.message}</span>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Gender</label>
                <select
                  {...register('gender')}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Age</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    {...register('ageValue', { required: 'Age is required' })}
                    className="flex-1 bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                  />
                  <select
                    {...register('ageUnit')}
                    className="w-28 bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-3 text-primary-100 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                  >
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                  </select>
                </div>
                {errors.ageValue && <span className="text-xs text-red-400 mt-1 block">{errors.ageValue.message}</span>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Price (INR)</label>
                <input
                  type="number"
                  {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price cannot be negative' } })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
                {errors.price && <span className="text-xs text-red-400 mt-1 block">{errors.price.message}</span>}
              </div>

              {/* Vaccination Status */}
              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Vaccination</label>
                <select
                  {...register('vaccinationStatus')}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                >
                  <option value="Fully Vaccinated">Fully Vaccinated</option>
                  <option value="Partially Vaccinated">Partially Vaccinated</option>
                  <option value="Not Vaccinated">Not Vaccinated</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Description</label>
              <textarea
                rows="4"
                {...register('description', { required: 'Description is required' })}
                className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm resize-none"
              />
              {errors.description && <span className="text-xs text-red-400 mt-1 block">{errors.description.message}</span>}
            </div>
          </div>

          {/* Location info */}
          <div className="bg-primary-900/50 backdrop-blur-md border border-primary-800/80 rounded-2xl p-6 shadow-luxury">
            <h3 className="text-lg font-bold text-primary-100 flex items-center gap-2 mb-6 border-b border-primary-800/60 pb-3">
              <MapPin size={18} className="text-primary-400" />
              Location Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">City</label>
                <input
                  type="text"
                  {...register('city', { required: 'City is required' })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
                {errors.city && <span className="text-xs text-red-400 mt-1 block">{errors.city.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">State</label>
                <input
                  type="text"
                  {...register('state', { required: 'State is required' })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
                {errors.state && <span className="text-xs text-red-400 mt-1 block">{errors.state.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Pincode</label>
                <input
                  type="text"
                  {...register('pincode', { required: 'Pincode is required' })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
                {errors.pincode && <span className="text-xs text-red-400 mt-1 block">{errors.pincode.message}</span>}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent-gold hover:bg-accent-gold-light text-primary-950 font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-8 shadow-luxury"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminEditPetPage
