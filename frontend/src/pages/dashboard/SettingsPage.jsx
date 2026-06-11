import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Shield, Bell, HelpCircle, AlertTriangle, ToggleLeft, ToggleRight, Check } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState({
    emailEnquiries: true,
    emailMarketing: false,
    whatsappAlerts: true,
    smsAlerts: false,
  })

  const handleToggle = (key) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      toast.success('Preferences updated')
      return updated
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-100">Settings</h1>
        <p className="text-primary-400 mt-1">Manage notifications and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-primary-900/40 backdrop-blur-md border border-primary-800/80 rounded-2xl p-6 shadow-luxury">
            <h3 className="text-base font-bold text-primary-100 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-primary-400" />
              Account Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary-400">Account Type</span>
                <span className="font-semibold text-primary-200 capitalize">{user?.role || 'User'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary-400">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-primary-400">Member Since</span>
                <span className="text-primary-200">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'June 2026'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-primary-950/40 border border-primary-800/40 rounded-2xl p-5 flex gap-3 text-xs text-primary-400">
            <HelpCircle size={18} className="text-primary-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-primary-200 block mb-1">Need help?</span>
              Contact support at <a href="mailto:support@rvpetszone.com" className="text-accent-gold hover:underline">support@rvpetszone.com</a> for help with account verification or listings.
            </div>
          </div>
        </div>

        {/* Right Column - Configurations */}
        <div className="md:col-span-2 space-y-6">
          {/* Notification Preferences */}
          <div className="bg-primary-900/40 backdrop-blur-md border border-primary-800/80 rounded-2xl p-6 shadow-luxury">
            <h3 className="text-lg font-bold text-primary-100 flex items-center gap-2 mb-6 border-b border-primary-800/60 pb-3">
              <Bell size={18} className="text-primary-400" />
              Notification Settings
            </h3>

            <div className="space-y-6">
              {/* WhatsApp enquiries */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-primary-200">WhatsApp Buyer Notifications</h4>
                  <p className="text-xs text-primary-400 mt-0.5">Receive instantaneous notifications on WhatsApp when a buyer submits an enquiry.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('whatsappAlerts')}
                  className="text-primary-300 hover:text-white transition-colors shrink-0"
                >
                  {notifications.whatsappAlerts ? (
                    <ToggleRight size={38} className="text-accent-gold" />
                  ) : (
                    <ToggleLeft size={38} className="text-primary-600" />
                  )}
                </button>
              </div>

              {/* Email enquiries */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-primary-200">Email Alerts</h4>
                  <p className="text-xs text-primary-400 mt-0.5">Get emails whenever a listing is approved or an enquiry is submitted.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('emailEnquiries')}
                  className="text-primary-300 hover:text-white transition-colors shrink-0"
                >
                  {notifications.emailEnquiries ? (
                    <ToggleRight size={38} className="text-accent-gold" />
                  ) : (
                    <ToggleLeft size={38} className="text-primary-600" />
                  )}
                </button>
              </div>

              {/* SMS Alerts */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-primary-200">SMS Alerts</h4>
                  <p className="text-xs text-primary-400 mt-0.5">Send a fallback SMS alert to your registered mobile number for important actions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('smsAlerts')}
                  className="text-primary-300 hover:text-white transition-colors shrink-0"
                >
                  {notifications.smsAlerts ? (
                    <ToggleRight size={38} className="text-accent-gold" />
                  ) : (
                    <ToggleLeft size={38} className="text-primary-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-primary-900/40 backdrop-blur-md border border-red-900/30 rounded-2xl p-6 shadow-luxury">
            <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-4">
              <AlertTriangle size={18} />
              Danger Zone
            </h3>
            <p className="text-xs text-primary-400 mb-6">
              Deactivating your account will hide all your active pet listings and disable buyers from contacting you. This action is reversible by contacting administration support.
            </p>
            <button
              onClick={() => toast.error('Deactivation is managed by support. Email support@rvpetszone.com.')}
              className="px-5 py-3 border border-red-900/50 hover:bg-red-500/10 text-red-400 rounded-xl text-xs font-bold transition-all"
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
