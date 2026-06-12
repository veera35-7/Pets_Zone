import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, ClipboardList, Clock, CheckCircle, XCircle, MessageSquare, Shield, Loader2, Sparkles, Eye, TrendingUp } from 'lucide-react'
import api from '../../lib/axios'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data.stats)
      setAnalytics(res.data.analytics)
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

  const COLORS = ['#D4AF37', '#AA7C11', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#F59E0B', '#EF4444']

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
      title: 'Active Users Online',
      value: stats.activeUsers || 0,
      icon: Users,
      color: 'text-accent-gold font-extrabold',
      bg: 'bg-accent-gold/5',
      border: 'border-accent-gold/20',
      link: '/admin/users',
      isLive: true
    },
    {
      title: 'Total Views',
      value: stats.totalViews || 0,
      icon: Eye,
      color: 'text-primary-100',
      bg: 'bg-primary-900/40',
      link: '/admin/pets'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate || 0}%`,
      icon: TrendingUp,
      color: 'text-emerald-400 font-extrabold',
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
      link: '/admin/enquiries'
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
                } ${card.bg} hover:border-primary-650 transition-colors shadow-luxury group`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
                      {card.title}
                      {card.isLive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
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
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-primary-900/40 border border-primary-800/80 rounded-2xl p-6 shadow-luxury">
          <h3 className="text-xs font-bold text-primary-200 mb-4 uppercase tracking-wider">User Signup Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.userGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }} />
                <Area type="monotone" dataKey="Signups" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorSignups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pet Categories Chart */}
        <div className="bg-primary-900/40 border border-primary-800/80 rounded-2xl p-6 shadow-luxury">
          <h3 className="text-xs font-bold text-primary-200 mb-4 uppercase tracking-wider">Pet Category Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {analytics?.categories && analytics.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analytics.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-primary-500 text-xs">No listing data available</span>
            )}
          </div>
        </div>

        {/* Breed Popularity Chart */}
        <div className="bg-primary-900/40 border border-primary-800/80 rounded-2xl p-6 shadow-luxury lg:col-span-2">
          <h3 className="text-xs font-bold text-primary-200 mb-4 uppercase tracking-wider">Top Breed Popularity</h3>
          <div className="h-64">
            {analytics?.breeds && analytics.breeds.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.breeds} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#AA7C11" radius={[4, 4, 0, 0]}>
                    {analytics.breeds.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-primary-500 text-xs">No breed data available</span>
            )}
          </div>
        </div>
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
