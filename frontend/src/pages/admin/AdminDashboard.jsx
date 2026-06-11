import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, ClipboardList, Clock, CheckCircle, XCircle, MessageSquare, Shield, Loader2, Sparkles, Plus } from 'lucide-react'
import api from '../../lib/axios'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data.stats)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin stats.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 size={36} className="text-accent-gold animate-spin" />
        <span className="text-primary-400 text-sm">Fetching metrics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-2xl text-red-400 text-sm">
        {error}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'text-primary-100',
      bg: 'bg-primary-900/40',
      link: '/admin/users'
    },
    {
      title: 'Total Listings',
      value: stats.totalPets || 0,
      icon: ClipboardList,
      color: 'text-primary-100',
      bg: 'bg-primary-900/40',
      link: '/admin/pets'
    },
    {
      title: 'Pending Review',
      value: stats.pendingPets || 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/20',
      link: '/admin/pets?status=pending'
    },
    {
      title: 'Approved Listings',
      value: stats.approvedPets || 0,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
      link: '/admin/pets?status=approved'
    },
    {
      title: 'Rejected Listings',
      value: stats.rejectedPets || 0,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      link: '/admin/pets?status=rejected'
    },
    {
      title: 'Total Enquiries',
      value: stats.totalEnquiries || 0,
      icon: MessageSquare,
      color: 'text-primary-100',
      bg: 'bg-primary-900/40',
      link: '/admin/enquiries'
    }
  ]

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-100">Stats Overview</h1>
          <p className="text-primary-400 mt-1">Platform analytics and listing review controls.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-gold/10 border border-accent-gold/20 rounded-xl text-accent-gold text-xs font-semibold">
          <Shield size={14} />
          <span>Secured Area</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Link
                to={card.link}
                className={`block p-6 rounded-2xl backdrop-blur-md border ${
                  card.border || 'border-primary-800/80'
                } ${card.bg} hover:border-primary-600 transition-colors shadow-luxury group`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider block">
                      {card.title}
                    </span>
                    <span className={`text-4xl font-extrabold mt-4 block ${card.color}`}>
                      {card.value}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl bg-primary-800/50 ${card.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        )}
      </div>

      {/* Admin Actions Panel */}
      <div className="bg-primary-900/40 border border-primary-800/80 rounded-2xl p-6 shadow-luxury">
        <h3 className="text-lg font-bold text-primary-100 flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-accent-gold" />
          Administrative Tasks
        </h3>
        <p className="text-primary-400 text-sm mb-6">
          Review listing submissions, manage accounts, and read overall enquiries sent across the RV Pets Zone platform.
        </p>

        <div className="flex flex-wrap gap-4">
          {stats.pendingPets > 0 && (
            <Link
              to="/admin/pets?status=pending"
              className="flex items-center gap-2 bg-accent-gold hover:bg-accent-gold-light text-primary-950 font-bold px-5 py-3 rounded-xl text-sm transition-all"
            >
              <Clock size={16} />
              Review Pending Pets ({stats.pendingPets})
            </Link>
          )}
          <Link
            to="/admin/pets"
            className="flex items-center gap-2 bg-primary-800 hover:bg-primary-700 text-primary-200 border border-primary-700 px-5 py-3 rounded-xl text-sm transition-all"
          >
            Manage All Pets
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-2 bg-primary-800 hover:bg-primary-700 text-primary-200 border border-primary-700 px-5 py-3 rounded-xl text-sm transition-all"
          >
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
