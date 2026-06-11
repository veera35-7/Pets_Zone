import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/axios'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          })
          return { success: true, user: data.user }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Login failed' }
        }
      },

      signup: async (formData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/signup', formData)
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Signup failed' }
        }
      },

      sendOtp: async (mobile) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/otp/send', { mobile })
          set({ isLoading: false })
          return { success: true, otp: data.otp }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Failed to send OTP' }
        }
      },

      verifyOtp: async (mobile, otp) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/otp/verify', { mobile, otp })
          if (!data.isNewUser) {
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            set({ isLoading: false })
          }
          return { success: true, isNewUser: data.isNewUser }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'OTP verification failed' }
        }
      },

      completeOtpRegistration: async (mobile, fullName, email) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/otp/complete', { mobile, fullName, email })
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Profile setup failed' }
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data.user })
        } catch {
          get().logout()
        }
      },

      updateUser: (updatedUser) => set({ user: updatedUser }),

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'rv-pets-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated })
    }
  )
)

export default useAuthStore
