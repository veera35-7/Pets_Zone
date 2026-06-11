import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Upload, X, ShieldAlert, Award, FileText, Image as ImageIcon, MapPin, DollarSign, Loader2, Sparkles } from 'lucide-react'
import api from '../../lib/axios'

const AddPetPage = () => {
  const navigate = useNavigate()
  const [images, setImages] = useState([])
  const [imageErrors, setImageErrors] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      petType: 'Dog',
      gender: 'Male',
      ageUnit: 'Months',
      vaccinationStatus: 'Fully Vaccinated'
    }
  })

  // Handles image selection
  const handleImageChange = (e) => {
    setImageErrors('')
    const files = Array.from(e.target.files)

    if (images.length + files.length > 6) {
      setImageErrors('You can upload a maximum of 6 images.')
      return
    }

    const validFiles = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setImageErrors('Only image files are allowed.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageErrors('Each image must be smaller than 5MB.')
        return
      }
      validFiles.push({
        file,
        preview: URL.createObjectURL(file)
      })
    }

    setImages((prev) => [...prev, ...validFiles])
  }

  // Removes a selected image
  const removeImage = (index) => {
    setImages((prev) => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[index].preview)
      copy.splice(index, 1)
      return copy
    })
  }

  const onSubmit = async (data) => {
    setSubmitError('')
    if (images.length === 0) {
      setImageErrors('At least one image is required.')
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()

    // Append text fields
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key])
    })

    // Append images
    images.forEach((img) => {
      formData.append('images', img.file)
    })

    try {
      await api.post('/pets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setSubmitSuccess(true)
      setTimeout(() => {
        navigate('/dashboard/my-listings')
      }, 3000)
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit pet listing.')
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center animate-fade-in">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-primary-900/50 backdrop-blur-md border border-primary-800 rounded-3xl p-8 shadow-luxury flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/30">
            <Sparkles size={32} />
          </div>
          <h2 className="text-2xl font-bold text-primary-100">Listing Submitted!</h2>
          <p className="text-primary-400 mt-3 text-sm">
            Thank you for listing your pet on RV Pets Zone. Our administration team is reviewing the listing details.
          </p>
          <p className="text-accent-gold mt-6 font-semibold text-xs uppercase tracking-widest animate-pulse">
            Redirecting to listings...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-100">List a Pet</h1>
        <p className="text-primary-400 mt-1">Submit your pet for admin review to make it visible to potential buyers.</p>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/20 border border-red-900/50 p-4 rounded-2xl">
          <ShieldAlert size={20} />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Images */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-primary-900/50 backdrop-blur-md border border-primary-800/80 rounded-2xl p-6 shadow-luxury">
            <h3 className="text-lg font-bold text-primary-100 flex items-center gap-2 mb-4">
              <ImageIcon size={18} className="text-primary-400" />
              Pet Images
            </h3>

            {/* Upload Area */}
            <div className="relative border-2 border-dashed border-primary-800 hover:border-primary-600 rounded-xl p-6 transition-colors flex flex-col items-center justify-center text-center cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isSubmitting}
              />
              <Upload size={32} className="text-primary-500 mb-3" />
              <span className="text-sm font-semibold text-primary-200">Drag & Drop or Click</span>
              <span className="text-xs text-primary-500 mt-1">Up to 6 images, max 5MB each</span>
            </div>

            {imageErrors && (
              <span className="text-xs text-red-400 mt-2 block">{imageErrors}</span>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                <AnimatePresence>
                  {images.map((img, index) => (
                    <motion.div
                      key={img.preview}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-lg overflow-hidden bg-primary-950 border border-primary-800 group"
                    >
                      <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-accent-gold text-primary-950 text-[9px] font-bold rounded">
                          Cover
                        </span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Admin Policy card */}
          <div className="bg-primary-950/40 border border-primary-800/40 rounded-2xl p-5 flex gap-3 text-xs text-primary-400">
            <ShieldAlert size={18} className="text-accent-gold shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-primary-200 block mb-1">Admin Approval Guard</span>
              All submissions undergo manual administrative review before becoming public. Listings containing incorrect info, spam, or poor images will be rejected.
            </div>
          </div>
        </div>

        {/* Right column - Form details */}
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
                  placeholder="e.g. Max"
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
                  placeholder="e.g. Golden Retriever"
                  {...register('breed', { required: 'Breed is required' })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
                {errors.breed && <span className="text-xs text-red-400 mt-1 block">{errors.breed.message}</span>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Gender</label>
                <div className="flex gap-4">
                  {['Male', 'Female'].map((gen) => (
                    <label
                      key={gen}
                      className="flex-1 flex items-center justify-center py-3 border border-primary-800 rounded-xl bg-primary-950/30 hover:border-primary-600 cursor-pointer text-sm font-medium transition-all"
                    >
                      <input
                        type="radio"
                        value={gen}
                        {...register('gender')}
                        className="sr-only"
                      />
                      <span className="text-primary-300">{gen}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Age</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Value"
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
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-500 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Price"
                    {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price cannot be negative' } })}
                    className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 pl-8 pr-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                  />
                </div>
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
                placeholder="Describe the pet's temperament, habits, and any other important details..."
                {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Write at least 20 characters' } })}
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
                  placeholder="e.g. Mumbai"
                  {...register('city', { required: 'City is required' })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
                {errors.city && <span className="text-xs text-red-400 mt-1 block">{errors.city.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">State</label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra"
                  {...register('state', { required: 'State is required' })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
                {errors.state && <span className="text-xs text-red-400 mt-1 block">{errors.state.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">Pincode</label>
                <input
                  type="text"
                  placeholder="e.g. 400001"
                  {...register('pincode', { required: 'Pincode is required', pattern: { value: /^[0-9]{6}$/, message: 'Must be 6 digits' } })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 px-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
                {errors.pincode && <span className="text-xs text-red-400 mt-1 block">{errors.pincode.message}</span>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-100 hover:bg-white text-primary-950 font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-8 shadow-luxury"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit for Admin Review'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddPetPage
