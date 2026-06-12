import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, Heart, LogOut, PlusCircle, LayoutDashboard, MessageSquare } from 'lucide-react'
import useAuthStore from '../store/authStore'
import NotificationBell from './NotificationBell'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Browse Pets', to: '/browse' },
    { label: 'AI Matchmaker', to: '/recommendations' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-primary-950/95 backdrop-blur-md border-b border-primary-800 shadow-luxury'
          : 'bg-transparent'
      }`}
    >
      <nav className="page-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-100 flex items-center justify-center">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <div className="text-primary-50 font-bold text-lg leading-none">RV Pets Zone</div>
              <div className="text-primary-500 text-xs">Premium Pet Marketplace</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors duration-200 hover:text-white ${
                  location.pathname === link.to ? 'text-white' : 'text-primary-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isAdmin() && (
                  <Link to="/admin" className="btn-outline text-sm py-2 px-4">
                    Admin Panel
                  </Link>
                )}
                <Link to="/dashboard/add-pet" className="btn-gold text-sm py-2 px-4">
                  <PlusCircle size={16} />
                  List Pet
                </Link>
                <NotificationBell />
                <div className="relative group">
                  <button className="w-10 h-10 rounded-full bg-primary-800 border border-primary-700 flex items-center justify-center hover:border-primary-400 transition-colors">
                    <User size={18} className="text-primary-300" />
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-12 w-52 bg-primary-900 border border-primary-700 rounded-xl shadow-luxury opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-3 border-b border-primary-800">
                      <div className="text-sm font-semibold text-primary-100">{user?.fullName}</div>
                      <div className="text-xs text-primary-500 truncate">{user?.email}</div>
                    </div>
                    <div className="py-2">
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-primary-300 hover:text-white hover:bg-primary-800 transition-colors">
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <Link to="/dashboard/chat" className="flex items-center gap-3 px-4 py-2 text-sm text-primary-300 hover:text-white hover:bg-primary-800 transition-colors">
                        <MessageSquare size={15} /> Chat Inbox
                      </Link>
                      <Link to="/dashboard/favorites" className="flex items-center gap-3 px-4 py-2 text-sm text-primary-300 hover:text-white hover:bg-primary-800 transition-colors">
                        <Heart size={15} /> Favorites
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-primary-800 transition-colors">
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm py-2 px-5">Login</Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-5">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-primary-900 border border-primary-800 flex items-center justify-center text-primary-300 hover:text-white"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary-950 border-b border-primary-800"
          >
            <div className="page-container py-4 flex flex-col gap-2">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="px-4 py-3 rounded-xl text-primary-300 hover:text-white hover:bg-primary-900 transition-colors text-sm font-medium">
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-primary-800 pt-3 mt-1 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="px-4 py-3 rounded-xl text-primary-300 hover:text-white hover:bg-primary-900 transition-colors text-sm">Dashboard</Link>
                    <Link to="/dashboard/add-pet" className="btn-gold text-sm">
                      <PlusCircle size={16} /> List a Pet
                    </Link>
                    {isAdmin() && <Link to="/admin" className="btn-outline text-sm">Admin Panel</Link>}
                    <button onClick={handleLogout} className="px-4 py-3 rounded-xl text-red-400 hover:bg-primary-900 text-sm text-left">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-outline text-sm">Login</Link>
                    <Link to="/signup" className="btn-primary text-sm">Sign Up Free</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
