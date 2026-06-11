import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const SignupPage = () => {
  const [showPw, setShowPw] = useState(false)
  const { signup, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    const { confirmPassword, ...formData } = data
    const result = await signup(formData)
    if (result.success) {
      toast.success('Account created successfully! 🎉')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  const benefits = [
    'List your pets for free',
    'Admin-verified listings',
    'Direct buyer enquiries',
    'Manage all listings in one place',
  ]

  return (
    <div className="min-h-screen bg-primary-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary-900 border-r border-primary-800 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent-gold/5 via-transparent to-transparent" />
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
            <span className="text-primary-950 font-black text-sm">RV</span>
          </div>
          <span className="text-primary-50 font-bold text-lg">RV Pets Zone</span>
        </Link>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-black text-primary-50 leading-tight">
            Join India's<br />
            <span className="text-gradient-gold">Premium</span><br />
            Pet Community
          </h1>
          <ul className="space-y-3">
            {benefits.map(b => (
              <li key={b} className="flex items-center gap-3 text-primary-300 text-sm">
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-primary-600 text-xs relative z-10">Free to join. No hidden fees.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
                <span className="text-primary-950 font-black text-sm">RV</span>
              </div>
              <span className="text-primary-50 font-bold text-lg">RV Pets Zone</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-primary-50 mb-2">Create Account</h2>
            <p className="text-primary-400">Start your pet journey today</p>
          </div>

          <div className="mb-6 bg-primary-900/40 border border-primary-800 p-4 rounded-xl text-xs flex justify-between items-center gap-3">
            <div className="text-primary-400">
              <strong className="text-primary-200 block mb-0.5">Prefer Mobile OTP registration?</strong>
              Register or login in seconds using only your mobile number.
            </div>
            <Link to="/login?mode=otp" className="text-accent-gold hover:underline font-bold shrink-0">
              Use OTP Login
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="input-label">Full Name *</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                <input
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name too short' }
                  })}
                  className="input pl-10"
                  placeholder="John Doe"
                  id="signup-name"
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="input-label">Mobile Number *</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                <input
                  {...register('mobile', {
                    required: 'Mobile is required',
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit Indian mobile number' }
                  })}
                  className="input pl-10"
                  placeholder="9876543210"
                  type="tel"
                  maxLength={10}
                  id="signup-mobile"
                />
              </div>
              {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="input-label">Email Address *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }
                  })}
                  type="email"
                  className="input pl-10"
                  placeholder="you@example.com"
                  id="signup-email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type={showPw ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Min 6 characters"
                  id="signup-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-300">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
              id="signup-submit"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Creating Account...</>
              ) : (
                <>Create Account <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          <p className="text-primary-500 text-xs mt-4 text-center leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>

          <div className="mt-6 text-center">
            <p className="text-primary-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-200 hover:text-white font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SignupPage
