import { Search, Heart, Settings, LogOut, MapPin, Star, Calendar, TrendingUp } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { propertiesAPI, authAPI } from "@/lib/api"
import type { PropertyDto } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { PaymentModal } from "@/components/payment/PaymentModal"
import { propertyRequestAPI, type PropertyRequestDto } from "@/lib/api"

export default function DashboardSeekerPage() {
  const [properties, setProperties] = useState<PropertyDto[]>([])
  const [requests, setRequests] = useState<PropertyRequestDto[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PropertyRequestDto | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      toast.error("Please login to access your dashboard", {
        position: "top-right",
        autoClose: 3000,
      })
      navigate('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (parsedUser.role !== 'SEEKER') {
        navigate('/dashboard/landlord')
        return
      }
    } catch (e) {
      toast.error("Invalid session. Please login again", {
        position: "top-right",
        autoClose: 3000,
      })
      navigate('/login')
      return
    }

    const fetchUserProfile = async () => {
      try {
        // Fetch latest profile data from API to get updated profileImageUrl
        const profile = await authAPI.getProfile()
        setUser(profile)
        // Update localStorage with fresh profile data
        localStorage.setItem('user', JSON.stringify(profile))
      } catch (err: any) {
        // If profile fetch fails, continue with localStorage data
        console.warn("Failed to fetch profile:", err.message)
      }
    }

    const fetchProperties = async () => {
      try {
        const data = await propertiesAPI.getAll()
        setProperties(data.slice(0, 6)) // Show 6 properties
      } catch (err: any) {
        toast.error("Failed to load properties: " + (err.message || "Unknown error"), {
          position: "top-right",
          autoClose: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    const fetchRequests = async () => {
      try {
        const data = await propertyRequestAPI.getMyRequests()
        setRequests(data)
      } catch (err) {
        console.error("Failed to fetch requests", err)
      }
    }

    // Fetch both profile, properties and requests
    fetchUserProfile()
    fetchProperties()
    fetchRequests()
  }, [navigate])

  const handlePayClick = (request: PropertyRequestDto) => {
    setSelectedRequest(request)
    setPaymentModalOpen(true)
  }

  const handlePaymentSuccess = () => {
    // In a real app, verify transaction
    // For now, we update local state optimistically or re-fetch
    if (selectedRequest) {
      // Assume backend or payment webhook will update status eventually
      // For visual feedback, we can manually trigger status update if backend allows, or just re-fetch
      // But since we don't have a direct "mark as paid" endpoint for frontend (insecure), 
      // we rely on re-fetching. For this demo, let's delay re-fetch slightly.
      setTimeout(async () => {
        const data = await propertyRequestAPI.getMyRequests()
        setRequests(data)
      }, 1000)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 2000,
    })
    navigate('/')
  }

  if (!user) {
    return null
  }

  const userInitials = user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'GR'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EDE4] via-[#F9F7F2] to-[#F2EDE4] flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        {/* Profile Header */}
        <Card className="mb-8 border-primary-lightest shadow-lg bg-white">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-[#2D3142]">
                <AvatarImage src={user?.profileImageUrl} alt={user?.fullName} />
                <AvatarFallback className="bg-primary-dark text-white text-2xl md:text-3xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-primary-dark">{user.fullName}</h1>
                  {user.emailVerified && (
                    <Badge className="bg-green-500 text-white">
                      <Star className="size-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Active Seeker</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/profile">
                  <Button variant="outline" className="w-full border-primary-lightest">
                    <Settings className="size-4 mr-2" /> Settings
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="w-full border-red-200 text-red-600 hover:bg-red-50">
                  <LogOut className="size-4 mr-2" /> Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link to="/explore">
            <Card className="hover:shadow-xl transition-all cursor-pointer border-primary-lightest bg-white group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="size-14 rounded-xl bg-gradient-to-br from-[#2D3142] to-[#1a1d2a] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search className="text-white size-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Explore Properties</h3>
                  <p className="text-sm text-muted-foreground">Browse verified rooms and flats</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/room-request">
            <Card className="hover:shadow-xl transition-all cursor-pointer border-primary-lightest bg-white group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="size-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="text-white size-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Request a Room</h3>
                  <p className="text-sm text-muted-foreground">Get notified when matching rooms are available</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/favorites">
            <Card className="hover:shadow-xl transition-all cursor-pointer border-primary-lightest bg-white group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="size-14 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="text-white size-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Favorites</h3>
                  <p className="text-sm text-muted-foreground">Your saved properties</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/seeker/availability-requests">
            <Card className="hover:shadow-xl transition-all cursor-pointer border-primary-lightest bg-white group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="size-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="text-white size-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Availability Alerts</h3>
                  <p className="text-sm text-muted-foreground">Manage your location alerts</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/seeker/feedback">
            <Card className="hover:shadow-xl transition-all cursor-pointer border-primary-lightest bg-white group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="size-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="text-white size-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Give Feedback</h3>
                  <p className="text-sm text-muted-foreground">Share your experience with us</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* My Applications */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">My Applications</h2>
          {requests.length === 0 ? (
            <Card className="p-8 text-center text-gray-500 bg-white border-primary-lightest">
              <p>You haven't applied for any properties yet.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <Card key={request.id} className="border-none shadow-md hover:shadow-lg transition-all bg-white">
                  <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={request.propertyImage || "/placeholder.svg"}
                          alt={request.propertyTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0D2440]">{request.propertyTitle}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`
                                                ${request.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : ''}
                                                ${request.status === 'REJECTED' ? 'bg-red-100 text-red-700' : ''}
                                                ${request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                                                ${request.status === 'PAID' ? 'bg-blue-100 text-blue-700' : ''}
                                            `}>
                            {request.status}
                          </Badge>
                          <span className="text-xs text-gray-400">{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {request.status === 'ACCEPTED' && (
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                        onClick={() => handlePayClick(request)}
                      >
                        Pay Booking Fee
                      </Button>
                    )}
                    {request.status === 'PAID' && (
                      <Button variant="outline" className="border-green-200 text-green-700 bg-green-50 pointer-events-none">
                        Booking Confirmed
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Featured Properties */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">Discover verified rooms and flats in Nepal</p>
            </div>
            <Link to="/explore">
              <Button className="bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg">View All</Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading properties...</p>
          ) : properties.length === 0 ? (
            <p className="text-muted-foreground">No properties available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link key={property.id} to={`/property/${property.id}`}>
                  <Card className="group border-primary-lightest overflow-hidden hover:shadow-xl transition-all bg-white">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={property.imageUrls?.[0] || "/placeholder.svg"}
                        alt={property.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                      />
                      {property.verified && (
                        <Badge className="absolute top-3 right-3 bg-green-500 text-white shadow-lg">
                          <Star className="size-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary-dark transition-colors">{property.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="size-4" /> {property.city}, {property.district}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-primary-lightest">
                        <div>
                          <div className="font-bold text-xl text-primary-dark">Rs. {property.price.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">per month</div>
                        </div>
                        <Button size="sm" className="bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {
        selectedRequest && (
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            amount={selectedRequest.propertyPrice || 5000} // Default booking amount if price missing
            propertyId={selectedRequest.propertyId}
            requestId={selectedRequest.id}
            propertyTitle={selectedRequest.propertyTitle}
            onSuccess={handlePaymentSuccess}
          />
        )
      }
    </div >
  )
}

