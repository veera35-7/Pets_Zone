import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Heart, MessageSquare, Settings, PlusCircle,
  LayoutDashboard, LogOut, Menu, X, ChevronRight, List
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import Navbar from '../../components/Navbar'

const sidebarLinks = [
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
  { to: '/dashboard/my-listings', icon: List, label: 'My Listings' },
  { to: '/dashboard/add-pet', icon: PlusCircle, label: 'Add Pet' },
  { to: '/dashboard/favorites', icon: Heart, label: 'Favorites' },
  { to: '/dashboard/enquiries', icon: MessageSquare, label: 'Enquiries' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const DashboardLayout = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* User Info */}
      <div className="p-6 border-b border-primary-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-700 flex items-center justify-center text-primary-200 font-bold text-lg">
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-primary-100 font-bold truncate">{user?.fullName}</div>
            <div className="text-primary-500 text-xs truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-100 text-primary-950'
                  : 'text-primary-400 hover:text-primary-100 hover:bg-primary-800'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-primary-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 md:pt-20 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 h-[calc(100vh-80px)] sticky top-20 bg-primary-900 border-r border-primary-800 shrink-0">
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
                className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-primary-900 border-r border-primary-800"
              >
                <div className="pt-20 h-full">
                  <Sidebar />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-80px)] p-4 md:p-8">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center gap-3 mb-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-10 h-10 rounded-xl bg-primary-900 border border-primary-800 flex items-center justify-center text-primary-400"
            >
              <Menu size={18} />
            </button>
            <span className="text-primary-200 font-semibold">Dashboard</span>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
