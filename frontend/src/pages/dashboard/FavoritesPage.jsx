import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Search, Loader2, Info } from 'lucide-react'
import api from '../../lib/axios'
import PetCard from '../../components/PetCard'

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites')
      setFavorites(res.data.favorites || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch favorites.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  const handleFavoriteToggle = (petId, isNowFavorited) => {
    if (!isNowFavorited) {
      // Remove from lists on unfavorite
      setFavorites((prev) => prev.filter((pet) => pet._id !== petId))
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-100">Saved Favorites</h1>
        <p className="text-primary-400 mt-1">Keep track of the pets you are interested in.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={30} className="text-primary-400 animate-spin" />
          <span className="text-primary-400 text-sm">Loading favorites...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/20 border border-red-900/50 p-4 rounded-2xl">
          <Info size={20} />
          <span>{error}</span>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-primary-800 rounded-2xl bg-primary-900/10">
          <Heart size={40} className="mx-auto text-primary-500 mb-4" />
          <h3 className="text-xl font-bold text-primary-200">No Favorites Yet</h3>
          <p className="text-primary-400 text-sm mt-1 mb-6">Explore listings and click the heart icon to save them here.</p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 bg-primary-800 hover:bg-primary-700 text-primary-100 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border border-primary-700"
          >
            <Search size={16} />
            Browse Pets
          </Link>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {favorites.map((pet) => (
              <PetCard
                key={pet._id}
                pet={pet}
                isFavorited={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export default FavoritesPage
