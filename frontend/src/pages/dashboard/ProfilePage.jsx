import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Lock, CheckCircle, AlertCircle, Loader2, ShieldCheck, FileText, UploadCloud, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import useAuthStore from '../../store/authStore'
import api from '../../lib/axios'

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore()
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [aadhaarLoading, setAadhaarLoading] = useState(false)
  const [aadhaarSuccess, setAadhaarSuccess] = useState('')
  const [aadhaarError, setAadhaarError] = useState('')

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      mobile: user?.mobile || '',
    }
  })

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm()

  const handleAadhaarUpload = async (e) => {
    e.preventDefault()
    if (!aadhaarFile) {
      setAadhaarError('Please select a file first.')
      return
    }
    setAadhaarLoading(true)
    setAadhaarSuccess('')
    setAadhaarError('')

    const formData = new FormData()
    formData.append('aadhaar', aadhaarFile)

    try {
      const res = await api.post('/auth/upload-aadhaar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      updateUser(res.data.user)
      setAadhaarSuccess('Aadhaar uploaded successfully! Status set to pending.')
      setAadhaarFile(null)
    } catch (err) {
      setAadhaarError(err.response?.data?.message || 'Failed to upload Aadhaar.')
    } finally {
      setAadhaarLoading(false)
    }
  }

  const onUpdateProfile = async (data) => {
    setProfileLoading(true)
    setProfileSuccess('')
    setProfileError('')
    try {
      const res = await api.put('/auth/profile', data)
      updateUser(res.data.user)
      setProfileSuccess('Profile updated successfully.')
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  const onChangePassword = async (data) => {
    setPasswordLoading(true)
    setPasswordSuccess('')
    setPasswordError('')
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      setPasswordSuccess('Password changed successfully.')
      resetPassword()
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-100">Account Profile</h1>
        <p className="text-primary-400 mt-1">Manage your public information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-primary-900/50 backdrop-blur-md border border-primary-800/80 rounded-2xl p-6 shadow-luxury"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-800 rounded-xl text-primary-100">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-100">Personal Info</h2>
              <p className="text-xs text-primary-400">Your registered profile details</p>
            </div>
          </div>

          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
            {profileSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 p-3 rounded-xl">
                <CheckCircle size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/20 border border-red-900/50 p-3 rounded-xl">
                <AlertCircle size={16} />
                <span>{profileError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  {...registerProfile('fullName', { required: 'Name is required' })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 pl-10 pr-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
              </div>
              {profileErrors.fullName && (
                <span className="text-xs text-red-400 mt-1 block">{profileErrors.fullName.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-500">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  {...registerProfile('mobile', {
                    required: 'Mobile is required',
                    pattern: {
                      value: /^[0-9]{10,12}$/,
                      message: 'Please enter a valid mobile number'
                    }
                  })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 pl-10 pr-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                />
              </div>
              {profileErrors.mobile && (
                <span className="text-xs text-red-400 mt-1 block">{profileErrors.mobile.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2">
                Email Address (Not editable)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-600">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-primary-950/20 border border-primary-900 rounded-xl py-3 pl-10 pr-4 text-primary-500 cursor-not-allowed text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-primary-100 hover:bg-white text-primary-950 font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-6"
            >
              {profileLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Change Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-primary-900/50 backdrop-blur-md border border-primary-800/80 rounded-2xl p-6 shadow-luxury"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-800 rounded-xl text-primary-100">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-100">Security</h2>
              <p className="text-xs text-primary-400">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 p-3 rounded-xl">
                <CheckCircle size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/20 border border-red-900/50 p-3 rounded-xl">
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 pl-10 pr-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                  placeholder="••••••••"
                />
              </div>
              {passwordErrors.currentPassword && (
                <span className="text-xs text-red-400 mt-1 block">{passwordErrors.currentPassword.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="w-full bg-primary-950/50 border border-primary-800 rounded-xl py-3 pl-10 pr-4 text-primary-100 placeholder-primary-600 focus:outline-none focus:border-primary-100 transition-colors text-sm"
                  placeholder="••••••••"
                />
              </div>
              {passwordErrors.newPassword && (
                <span className="text-xs text-red-400 mt-1 block">{passwordErrors.newPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-primary-800 border border-primary-700 hover:bg-primary-700 hover:border-primary-600 text-primary-100 font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-6"
            >
              {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : 'Change Password'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Aadhaar Seller Verification Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-primary-900/50 backdrop-blur-md border border-primary-800/80 rounded-2xl p-6 shadow-luxury"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary-800 rounded-xl text-primary-100">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-100">Seller Verification</h2>
            <p className="text-xs text-primary-400">Verify your seller account with Aadhaar</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Indicators */}
          <div className="flex items-center gap-4 p-4 bg-primary-950/40 border border-primary-800 rounded-xl">
            <div className="text-sm font-semibold text-primary-300">Status:</div>
            {user?.aadhaarStatus === 'approved' || user?.isVerifiedSeller ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle size={12} /> Verified Seller
              </span>
            ) : user?.aadhaarStatus === 'pending' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock size={12} /> Pending Verification
              </span>
            ) : user?.aadhaarStatus === 'rejected' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertCircle size={12} /> Verification Rejected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-800 text-primary-400 border border-primary-700">
                Not Verified
              </span>
            )}
          </div>

          {aadhaarSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 p-3 rounded-xl">
              <CheckCircle size={16} />
              <span>{aadhaarSuccess}</span>
            </div>
          )}
          {aadhaarError && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/20 border border-red-900/50 p-3 rounded-xl">
              <AlertCircle size={16} />
              <span>{aadhaarError}</span>
            </div>
          )}

          {/* Conditional displays */}
          {user?.aadhaarStatus === 'approved' || user?.isVerifiedSeller ? (
            <div className="p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-xl text-sm text-primary-300 space-y-2">
              <p>🎉 Your Aadhaar identity check is complete. The **Verified Seller** badge is active on your profile and listings.</p>
              {user?.aadhaarUrl && (
                <a href={user.aadhaarUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline">
                  <FileText size={12} /> View Uploaded Document
                </a>
              )}
            </div>
          ) : user?.aadhaarStatus === 'pending' ? (
            <div className="p-4 bg-amber-950/10 border border-amber-900/30 rounded-xl text-sm text-primary-300 space-y-2">
              <p>⏳ We are currently reviewing your uploaded Aadhaar card details. This usually takes 24-48 hours. Once verified, your status will update automatically.</p>
              {user?.aadhaarUrl && (
                <a href={user.aadhaarUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline">
                  <FileText size={12} /> View Uploaded Document
                </a>
              )}
            </div>
          ) : (
            /* Upload form for 'none' or 'rejected' */
            <form onSubmit={handleAadhaarUpload} className="space-y-4">
              {user?.aadhaarStatus === 'rejected' && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-300">
                  ⚠️ Your previous upload was rejected. Please ensure the full name, photo, and details on your card are clearly readable and match your profile name.
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-primary-400 uppercase tracking-wider">
                  Upload Aadhaar Document (JPEG, PNG or WebP)
                </label>
                
                <div className="border-2 border-dashed border-primary-800 hover:border-primary-700 transition-colors rounded-xl p-6 flex flex-col items-center justify-center bg-primary-950/30 group relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAadhaarFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud size={32} className="text-primary-500 group-hover:text-primary-400 mb-2 transition-colors" />
                  {aadhaarFile ? (
                    <div className="text-center">
                      <p className="text-sm font-semibold text-primary-200">{aadhaarFile.name}</p>
                      <p className="text-xs text-primary-500">{(aadhaarFile.size / 1024 / 1024).toFixed(2)} MB • Click to replace</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-primary-300 font-medium">Click to select or drag Aadhaar photo</p>
                      <p className="text-xs text-primary-500">Supported formats: JPEG, PNG, WebP (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={aadhaarLoading || !aadhaarFile}
                className="w-full bg-primary-100 hover:bg-white text-primary-950 font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {aadhaarLoading ? <Loader2 size={16} className="animate-spin" /> : 'Submit Aadhaar for Verification'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ProfilePage
