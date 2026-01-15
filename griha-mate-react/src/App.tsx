import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Pages
import HomePage from './pages/Home'
import AboutPage from './pages/About'
import ExplorePage from './pages/Explore'
import HowItWorksPage from './pages/HowItWorks'
import ListPropertyPage from './pages/ListProperty'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ProfilePage from './pages/Profile'
import PropertyDetailPage from './pages/PropertyDetail'
import DashboardLandlordPage from './pages/DashboardLandlord'
import DashboardSeekerPage from './pages/DashboardSeeker'
import ContactPage from './pages/Contact'
import TermsPage from './pages/Terms'
import PrivacyPage from './pages/Privacy'
import HelpPage from './pages/Help'
import TrustSafetyPage from './pages/TrustSafety'
import AdminPage from './pages/Admin'
import FavoritesPage from './pages/Favorites'
import ManagePropertiesPage from './pages/ManageProperties'
import NotFoundPage from './pages/NotFound'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/list-property" element={<ListPropertyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        <Route path="/dashboard/landlord" element={<DashboardLandlordPage />} />
        <Route path="/dashboard/seeker" element={<DashboardSeekerPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/trust-safety" element={<TrustSafetyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
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
