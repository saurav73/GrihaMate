import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AutoLogoutHandler } from './components/AutoLogoutHandler'

// Pages
import HomePage from './pages/public/Home'
import AboutPage from './pages/public/About'
import ExplorePage from './pages/public/Explore'
import HowItWorksPage from './pages/public/HowItWorks'
import ListPropertyPage from './pages/landlord/ListProperty'
import LoginPage from './pages/auth/Login'
import RegisterPage from './pages/auth/Register'
import AdminLoginPage from './pages/auth/AdminLogin'
import ProfilePage from './pages/user/Profile'
import PropertyDetailPage from './pages/property/PropertyDetail'
import DashboardLandlordPage from './pages/landlord/DashboardLandlord'
import LandlordRequestsPage from './pages/landlord/LandlordRequests'
import DashboardSeekerPage from './pages/seeker/DashboardSeeker'
import ContactPage from './pages/public/Contact'
import TermsPage from './pages/public/Terms'
import PrivacyPage from './pages/public/Privacy'
import HelpPage from './pages/public/Help'
import TrustSafetyPage from './pages/public/TrustSafety'
import AdminDashboardPage from './pages/admin/Dashboard'
import AdminUsersPage from './pages/admin/Users'
import AdminRequestsPage from './pages/admin/Requests'
import FavoritesPage from './pages/seeker/Favorites'
import RoomRequestPage from './pages/seeker/RoomRequest'
import ManagePropertiesPage from './pages/landlord/ManageProperties'
import NotFoundPage from './pages/public/NotFound'

function App() {
  return (
    <Router>
      <AutoLogoutHandler />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/list-property" element={<ListPropertyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        <Route path="/dashboard/landlord" element={<DashboardLandlordPage />} />
        <Route path="/dashboard/landlord/requests" element={<LandlordRequestsPage />} />
        <Route path="/dashboard/seeker" element={<DashboardSeekerPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/trust-safety" element={<TrustSafetyPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/requests" element={<AdminRequestsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/room-request" element={<RoomRequestPage />} />
        <Route path="/manage-properties" element={<ManagePropertiesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  )
}

export default App
