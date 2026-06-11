import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Public pages
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import PetDetailPage from './pages/PetDetailPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Dashboard pages
import DashboardLayout from './pages/dashboard/DashboardLayout'
import ProfilePage from './pages/dashboard/ProfilePage'
import MyListingsPage from './pages/dashboard/MyListingsPage'
import AddPetPage from './pages/dashboard/AddPetPage'
import FavoritesPage from './pages/dashboard/FavoritesPage'
import EnquiriesPage from './pages/dashboard/EnquiriesPage'
import SettingsPage from './pages/dashboard/SettingsPage'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPetsPage from './pages/admin/AdminPetsPage'
import AdminEditPetPage from './pages/admin/AdminEditPetPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminEnquiriesPage from './pages/admin/AdminEnquiriesPage'

// Route guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/pet/:id" element={<PetDetailPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<ProfilePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="my-listings" element={<MyListingsPage />} />
          <Route path="add-pet" element={<AddPetPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="pets" element={<AdminPetsPage />} />
          <Route path="pets/:id/edit" element={<AdminEditPetPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="enquiries" element={<AdminEnquiriesPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
