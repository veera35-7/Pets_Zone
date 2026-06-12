import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Phone, Key, User, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { auth, RecaptchaVerifier, signInWithPhoneNumber, isFirebaseMock } from '../lib/firebase'

const LoginPage = () => {
  const [searchParams] = useSearchParams()
  const [loginMode, setLoginMode] = useState(() => searchParams.get('mode') === 'otp' ? 'otp' : 'email')
  const [otpStep, setOtpStep] = useState('mobile') // 'mobile' | 'code' | 'usercard'
  const [showPw, setShowPw] = useState(false)
  const [mobile, setMobile] = useState('')
  const [otpDev, setOtpDev] = useState('') // Stored OTP for developers
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [firebaseUid, setFirebaseUid] = useState('')

  const { login, sendOtp, verifyOtp, completeOtpRegistration, firebaseLogin, completeFirebaseRegistration, isLoading } = useAuthStore()
  const navigate = useNavigate()

  // Form for Email login
  const { register: registerEmail, handleSubmit: handleSubmitEmail, formState: { errors: emailErrors } } = useForm()

  // Form for OTP request
  const { register: registerMobile, handleSubmit: handleSubmitMobile, formState: { errors: mobileErrors } } = useForm()

  // Form for OTP verification
  const { register: registerOtpVerify, handleSubmit: handleSubmitOtpVerify, formState: { errors: otpErrors } } = useForm()

  // Form for User Registration Card
  const { register: registerUserCard, handleSubmit: handleSubmitUserCard, formState: { errors: cardErrors } } = useForm()

  const onEmailSubmit = async (data) => {
    const result = await login(data.email, data.password)
    if (result.success) {
      toast.success(`Welcome back, ${result.user.fullName}! 👋`)
      navigate(result.user.role === 'admin' ? '/admin' : '/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  const onMobileSubmit = async (data) => {
    const formattedMobile = data.mobile.trim()
    setMobile(formattedMobile)

    if (isFirebaseMock) {
      // Mock flow
      const result = await sendOtp(formattedMobile)
      if (result.success) {
        toast.success('OTP sent successfully (Mock Mode)')
        if (result.otp) {
          setOtpDev(result.otp)
          toast(`[DEV MODE] OTP Code is: ${result.otp}`, { icon: '🔑', duration: 8000 })
        }
        setOtpStep('code')
      } else {
        toast.error(result.message)
      }
    } else {
      // Firebase flow
      try {
        // Prepare reCAPTCHA
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {}
          })
        }
        const appVerifier = window.recaptchaVerifier
        const confirmation = await signInWithPhoneNumber(auth, `+91${formattedMobile}`, appVerifier)
        setConfirmationResult(confirmation)
        toast.success('Verification code sent to your phone!')
        setOtpStep('code')
      } catch (err) {
        toast.error(err.message || 'Failed to send OTP via Firebase')
        console.error('Firebase sign in error:', err)
      }
    }
  }

  const onOtpVerifySubmit = async (data) => {
    if (isFirebaseMock) {
      // Mock verification
      const result = await verifyOtp(mobile, data.otp)
      if (result.success) {
        if (result.isNewUser) {
          setFirebaseUid(`mock-uid-${mobile}`)
          toast.success('Mobile verified! Please set up your profile details.')
          setOtpStep('usercard')
        } else {
          toast.success('Logged in successfully! 👋')
          const currentUser = useAuthStore.getState().user
          navigate(currentUser?.role === 'admin' ? '/admin' : '/dashboard')
        }
      } else {
        toast.error(result.message)
      }
    } else {
      // Firebase verification
      if (!confirmationResult) {
        toast.error('No verification context. Please request OTP again.')
        return
      }
      try {
        const userCredential = await confirmationResult.confirm(data.otp)
        const idToken = await userCredential.user.getIdToken()

        // Send token to backend
        const result = await firebaseLogin(idToken)
        if (result.success) {
          if (result.isNewUser) {
            setFirebaseUid(result.firebaseUid)
            toast.success('Mobile verified! Please set up your profile details.')
            setOtpStep('usercard')
          } else {
            toast.success('Logged in successfully! 👋')
            const currentUser = useAuthStore.getState().user
            navigate(currentUser?.role === 'admin' ? '/admin' : '/dashboard')
          }
        } else {
          toast.error(result.message)
        }
      } catch (err) {
        toast.error(err.message || 'OTP verification failed via Firebase')
        console.error('OTP confirmation error:', err)
      }
    }
  }

  const onUserCardSubmit = async (data) => {
    if (isFirebaseMock) {
      const result = await completeOtpRegistration(mobile, data.fullName, data.email)
      if (result.success) {
        toast.success('Registration completed! Welcome to RV Pets Zone! 🎉')
        navigate('/dashboard')
      } else {
        toast.error(result.message)
      }
    } else {
      const result = await completeFirebaseRegistration(mobile, data.fullName, data.email, firebaseUid)
      if (result.success) {
        toast.success('Registration completed! Welcome to RV Pets Zone! 🎉')
        navigate('/dashboard')
      } else {
        toast.error(result.message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-primary-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary-900 border-r border-primary-800 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent-gold/5 via-transparent to-transparent" />
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-100 flex items-center justify-center">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-primary-50 font-bold text-lg">RV Pets Zone</span>
        </Link>
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-primary-50 leading-tight mb-4">
            Find Your<br />
            <span className="text-gradient-gold">Perfect</span><br />
            Companion
          </h1>
          <p className="text-primary-400 text-lg max-w-sm">India's most trusted premium pet marketplace. Verified listings, secure transactions.</p>
        </div>
        <div className="flex items-center gap-6 relative z-10 text-primary-500 text-sm">
          <span>500+ Listings</span>
          <span>•</span>
          <span>1000+ Happy Families</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-primary-950">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-100 flex items-center justify-center">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-primary-50 font-bold text-lg">RV Pets Zone</span>
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-black text-primary-50 mb-2">Sign In</h2>
            <p className="text-primary-400 text-sm">Access your RV Pets Zone dashboard</p>
          </div>

          {/* Tab Selector */}
          {otpStep !== 'usercard' && (
            <div className="flex border-b border-primary-800 mb-6 gap-6">
              <button
                type="button"
                onClick={() => { setLoginMode('email'); setOtpStep('mobile') }}
                className={`pb-3 text-sm font-semibold tracking-wider transition-colors ${
                  loginMode === 'email' ? 'border-b-2 border-primary-100 text-primary-100' : 'text-primary-500 hover:text-primary-300'
                }`}
              >
                EMAIL
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('otp')}
                className={`pb-3 text-sm font-semibold tracking-wider transition-colors ${
                  loginMode === 'otp' ? 'border-b-2 border-primary-100 text-primary-100' : 'text-primary-500 hover:text-primary-300'
                }`}
              >
                MOBILE OTP
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {loginMode === 'email' ? (
              /* Email Login Form */
              <motion.form
                key="email-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmitEmail(onEmailSubmit)}
                className="space-y-5"
              >
                <div>
                  <label className="input-label">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                    <input
                      {...registerEmail('email', {
                        required: 'Email is required',
                        pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }
                      })}
                      type="email"
                      className="input pl-10"
                      placeholder="you@example.com"
                      id="login-email"
                    />
                  </div>
                  {emailErrors.email && <p className="text-red-400 text-xs mt-1">{emailErrors.email.message}</p>}
                </div>

                <div>
                  <label className="input-label">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                    <input
                      {...registerEmail('password', { required: 'Password is required' })}
                      type={showPw ? 'text' : 'password'}
                      className="input pl-10 pr-10"
                      placeholder="••••••••"
                      id="login-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-300 transition-colors"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {emailErrors.password && <p className="text-red-400 text-xs mt-1">{emailErrors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed group py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  id="login-submit"
                >
                  {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                  ) : (
                    <>Sign In <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>
                  )}
                </button>
              </motion.form>
            ) : (
              /* OTP Login Workflow */
              <div className="space-y-5">
                {otpStep === 'mobile' && (
                  /* STEP 1: Enter Mobile */
                  <motion.form
                    key="otp-mobile-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSubmitMobile(onMobileSubmit)}
                    className="space-y-5"
                  >
                    <div>
                      <label className="input-label">Indian Mobile Number</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                        <input
                          {...registerMobile('mobile', {
                            required: 'Mobile number is required',
                            pattern: { value: /^[6-9]\d{9}$/, message: 'Please enter a valid 10-digit Indian mobile number' }
                          })}
                          type="tel"
                          maxLength={10}
                          className="input pl-10"
                          placeholder="e.g. 9876543210"
                        />
                      </div>
                      {mobileErrors.mobile && <p className="text-red-400 text-xs mt-1">{mobileErrors.mobile.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <><Loader2 size={16} className="animate-spin" /> Sending OTP...</>
                      ) : (
                        <>Send OTP Code <ArrowRight size={16} /></>
                      )}
                    </button>
                  </motion.form>
                )}

                {otpStep === 'code' && (
                  /* STEP 2: Enter Verification Code */
                  <motion.form
                    key="otp-code-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSubmitOtpVerify(onOtpVerifySubmit)}
                    className="space-y-5"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="input-label mb-0">Enter 6-Digit OTP</label>
                        <button
                          type="button"
                          onClick={() => setOtpStep('mobile')}
                          className="text-accent-gold text-xs hover:underline"
                        >
                          Change Number ({mobile})
                        </button>
                      </div>
                      <div className="relative">
                        <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                        <input
                          {...registerOtpVerify('otp', {
                            required: 'OTP is required',
                            pattern: { value: /^\d{6}$/, message: 'OTP must be exactly 6 digits' }
                          })}
                          type="text"
                          maxLength={6}
                          className="input pl-10 tracking-widest text-center text-lg font-bold"
                          placeholder="000000"
                        />
                      </div>
                      {otpErrors.otp && <p className="text-red-400 text-xs mt-1">{otpErrors.otp.message}</p>}
                      {otpDev && (
                        <p className="text-accent-gold/80 text-[11px] mt-2 block">
                          [DEV MODE] Paste: <span className="font-bold border-b border-dashed border-accent-gold/40 select-all">{otpDev}</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                      ) : (
                        <>Verify & Continue <ArrowRight size={16} /></>
                      )}
                    </button>
                  </motion.form>
                )}

                {otpStep === 'usercard' && (
                  /* STEP 3: User Card Form */
                  <motion.form
                    key="otp-usercard-form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onSubmit={handleSubmitUserCard(onUserCardSubmit)}
                    className="space-y-5 bg-primary-900/40 border border-primary-800 rounded-2xl p-6 shadow-luxury relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 text-accent-gold font-bold text-sm tracking-wider uppercase mb-2">
                      <Sparkles size={16} />
                      User Registration Card
                    </div>

                    <p className="text-xs text-primary-400 leading-relaxed">
                      We verified your mobile <strong className="text-primary-200">{mobile}</strong>! Complete this card to set up your premium profile.
                    </p>

                    {/* Name */}
                    <div>
                      <label className="input-label">Full Name</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                        <input
                          {...registerUserCard('fullName', { required: 'Name is required' })}
                          type="text"
                          className="input pl-10 bg-primary-950/70"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      {cardErrors.fullName && <p className="text-red-400 text-xs mt-1">{cardErrors.fullName.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="input-label">Email Address</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500" />
                        <input
                          {...registerUserCard('email', {
                            required: 'Email is required',
                            pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }
                          })}
                          type="email"
                          className="input pl-10 bg-primary-950/70"
                          placeholder="e.g. john@example.com"
                        />
                      </div>
                      {cardErrors.email && <p className="text-red-400 text-xs mt-1">{cardErrors.email.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-accent-gold hover:bg-accent-gold-light text-primary-950 font-bold py-3.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-luxury"
                    >
                      {isLoading ? (
                        <><Loader2 size={16} className="animate-spin" /> Submitting Details...</>
                      ) : (
                        <>Complete Profile <ArrowRight size={16} /></>
                      )}
                    </button>
                  </motion.form>
                )}
              </div>
            )}
          </AnimatePresence>

          {otpStep !== 'usercard' && (
            <div className="mt-6 text-center">
              <p className="text-primary-500 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-200 hover:text-white font-semibold transition-colors">
                  Sign up free
                </Link>
              </p>
            </div>
          )}

          {/* Admin hint */}
          <div className="mt-8 p-4 bg-primary-900/50 border border-primary-800 rounded-xl text-xs text-primary-500">
            <strong className="text-primary-400">Admin?</strong> Use your admin credentials under the EMAIL tab to access the Admin Panel.
          </div>
          <div id="recaptcha-container"></div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
