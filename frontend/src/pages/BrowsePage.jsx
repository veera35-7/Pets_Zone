import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import api from '../lib/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PetCard from '../components/PetCard'
import WhatsAppFAB from '../components/WhatsAppFAB'

const petTypes = ['all', 'Goat', 'Rabbit', 'Chicken', 'Duck', 'Guinea Pig', 'Other']
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

const BrowsePage = () => {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [city, setCity] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 })

  const fetchPets = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 12,
        sort: sortBy,
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(search && { search }),
        ...(city && { city }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      })

      const { data } = await api.get(`/pets?${params}`)

      if (reset || pageNum === 1) {
        setPets(data.pets)
      } else {
        setPets(prev => [...prev, ...data.pets])
      }

      setHasMore(data.pagination.hasMore)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [selectedType, search, sortBy, city, minPrice, maxPrice])

  // Initial fetch and filter changes
  useEffect(() => {
    setPage(1)
    fetchPets(1, true)
  }, [selectedType, search, sortBy, city, minPrice, maxPrice])

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loadingMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPets(nextPage, false)
    }
  }, [inView, hasMore, loadingMore, loading])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const clearFilters = () => {
    setSearch('')
    setSearchInput('')
    setSelectedType('all')
    setSortBy('newest')
    setCity('')
    setMinPrice('')
    setMaxPrice('')
    setShowFilters(false)
  }

  const hasActiveFilters = selectedType !== 'all' || search || city || minPrice || maxPrice

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="page-container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-primary-50 mb-2">Browse Pets</h1>
            <p className="text-primary-400">Discover verified pet listings across India</p>
          </div>

          {/* Search + Filters Bar */}
          <div className="sticky top-20 z-30 bg-primary-950/90 backdrop-blur-md py-4 -mx-4 px-4 mb-6 border-b border-primary-900">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="input pl-10 pr-4 h-11 w-full"
                  placeholder="Search by name, breed..."
                />
              </form>

              {/* Pet Type Filter */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {petTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedType === type
                        ? 'bg-primary-100 text-primary-950'
                        : 'bg-primary-900 text-primary-400 border border-primary-800 hover:border-primary-600'
                    }`}
                  >
                    {type === 'all' ? 'All' : type}
                  </button>
                ))}
              </div>

              {/* Sort + Filters */}
              <div className="flex gap-2 shrink-0">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="input h-11 py-0 text-sm cursor-pointer"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-11 px-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
                    showFilters || hasActiveFilters
                      ? 'bg-primary-100 text-primary-950 border-primary-100'
                      : 'bg-primary-900 text-primary-400 border-primary-800 hover:border-primary-600'
                  }`}
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent-gold" />}
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="flex flex-wrap gap-3 pt-3 border-t border-primary-900">
                    <input
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="input w-44 h-10 text-sm"
                      placeholder="City (e.g. Mumbai)"
                    />
                    <input
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      type="number"
                      className="input w-32 h-10 text-sm"
                      placeholder="Min Price"
                    />
                    <input
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      type="number"
                      className="input w-32 h-10 text-sm"
                      placeholder="Max Price"
                    />
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 bg-red-400/10 rounded-xl">
                        <X size={14} /> Clear All
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Count */}
          <div className="mb-5 text-primary-500 text-sm">
            {!loading && `${pets.length} pets found`}
          </div>

          {/* Pet Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card">
                  <div className="shimmer aspect-square" />
                  <div className="p-4 space-y-3">
                    <div className="shimmer h-5 rounded-lg w-3/4" />
                    <div className="shimmer h-4 rounded-lg w-1/2" />
                    <div className="shimmer h-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-primary-200 text-xl font-bold mb-2">No pets found</h3>
              <p className="text-primary-500 mb-6">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {pets.map(pet => <PetCard key={pet._id} pet={pet} />)}
              </div>
            </AnimatePresence>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="mt-10 flex justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-primary-400">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading more...</span>
              </div>
            )}
            {!hasMore && pets.length > 0 && (
              <p className="text-primary-600 text-sm">You've seen all {pets.length} listings</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  )
}

export default BrowsePage
