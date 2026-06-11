import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, List, MessageSquare, LogOut, Menu, X, LayoutDashboard, ArrowLeft
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import Navbar from '../../components/Navbar'

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Stats Overview', end: true },
  { to: '/admin/pets', icon: List, label: 'Pet Listings' },
  { to: '/admin/users', icon: Users, label: 'Manage Users' },
  { to: '/admin/enquiries', icon: MessageSquare, label: 'All Enquiries' },
]

const AdminLayout = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-primary-950 border-r border-primary-900">
      {/* Title */}
      <div className="p-6 border-b border-primary-900 flex items-center gap-2">
        <Shield className="text-accent-gold" size={20} />
        <div>
          <div className="text-primary-100 font-bold text-sm tracking-wider uppercase">Admin Portal</div>
          <div className="text-primary-500 text-[10px]">RV PETS ZONE</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        {adminLinks.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent-gold text-primary-950 font-semibold shadow-glow'
                  : 'text-primary-400 hover:text-primary-100 hover:bg-primary-900'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Return to website & Logout */}
      <div className="p-4 border-t border-primary-900 space-y-2">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary-300 hover:text-primary-100 hover:bg-primary-900 transition-all duration-200"
        >
          <ArrowLeft size={17} />
          View Website
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-primary-950">
      <Navbar />
      <div className="pt-16 md:pt-20 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 h-[calc(100vh-80px)] sticky top-20 bg-primary-950 shrink-0">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-primary-950"
              >
                <div className="pt-20 h-full">
                  <Sidebar />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-80px)] p-4 md:p-8 bg-primary-950">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="w-10 h-10 rounded-xl bg-primary-900 border border-primary-800 flex items-center justify-center text-primary-400"
              >
                <Menu size={18} />
              </button>
              <span className="text-primary-200 font-semibold">Admin Panel</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-accent-gold/15 border border-accent-gold/20 text-accent-gold text-[10px] uppercase font-bold tracking-widest">
              Admin
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
