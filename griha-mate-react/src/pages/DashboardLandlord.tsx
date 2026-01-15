import { 
  Users, Clock, CheckCircle2, Eye, Star, Calendar, TrendingUp, Settings, LogOut, Home, Plus
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { propertiesAPI, authAPI } from "@/lib/api"
import type { PropertyDto } from "@/lib/api"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

export default function DashboardLandlordPage() {
  const [properties, setProperties] = useState<PropertyDto[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
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
      
      if (parsedUser.role !== 'LANDLORD') {
        navigate('/dashboard/seeker')
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
        const data = await propertiesAPI.getMyProperties()
        setProperties(data)
      } catch (err: any) {
        toast.error("Failed to load your properties: " + (err.message || "Unknown error"), {
          position: "top-right",
          autoClose: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    // Fetch both profile and properties
    fetchUserProfile()
    fetchProperties()
  }, [navigate])

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

  const activeListings = properties.filter(p => p.status === 'AVAILABLE').length
  const totalViews = 1240 // Mock data - would come from backend
  const applications = 8 // Mock data
  const totalEarnings = 85000 // Mock data
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
                    <span className="text-muted-foreground">Active Landlord</span>
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

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-2">Welcome back, {user.fullName.split(' ')[0]}!</h2>
          <p className="text-muted-foreground">Here's what's happening with your properties today.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-primary-lightest">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-xl bg-primary-lightest flex items-center justify-center">
                    <Home className="size-6 text-primary-dark" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">+1 this month</span>
                </div>
                <div className="text-3xl font-bold mb-1">{activeListings}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Active Listings</div>
              </CardContent>
            </Card>

            <Card className="border-primary-lightest">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-xl bg-primary-lightest flex items-center justify-center">
                    <Users className="size-6 text-primary-dark" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">+12% from last week</span>
                </div>
                <div className="text-3xl font-bold mb-1">{totalViews.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Total Views</div>
              </CardContent>
            </Card>

            <Card className="border-primary-lightest">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-xl bg-primary-lightest flex items-center justify-center">
                    <Clock className="size-6 text-primary-dark" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">3 pending</span>
                </div>
                <div className="text-3xl font-bold mb-1">{applications}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Applications</div>
              </CardContent>
            </Card>

            <Card className="border-primary-lightest">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-xl bg-primary-lightest flex items-center justify-center">
                    <CheckCircle2 className="size-6 text-primary-dark" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">Paid this month</span>
                </div>
                <div className="text-3xl font-bold mb-1">Rs. {totalEarnings.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Total Earnings</div>
              </CardContent>
            </Card>
          </div>

        {/* Your Listings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-primary-dark mb-2">Your Listings</h3>
              <p className="text-muted-foreground">Manage and track your property listings</p>
            </div>
            <Link to="/list-property">
              <Button className="bg-primary-dark hover:bg-[#1a1d2a] text-white">+ New Listing</Button>
            </Link>
          </div>
            
            {loading ? (
              <p className="text-muted-foreground">Loading listings...</p>
            ) : properties.length === 0 ? (
              <Card className="border-primary-lightest">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No listings yet</p>
                  <Link to="/list-property">
                    <Button className="bg-primary-dark hover:bg-[#1F222E]">
                      <Plus className="size-4 mr-2" /> Create Your First Listing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.slice(0, 3).map((property) => (
                  <Link key={property.id} to={`/property/${property.id}`}>
                    <Card className="group border-primary-lightest overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={property.imageUrls?.[0] || "/placeholder.svg"}
                          alt={property.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold">{property.title}</h4>
                          <Badge className={property.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-500'}>
                            {property.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{property.address}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="size-3" /> 420 views
                            </span>
                          </div>
                          <div className="font-bold">Rs. {property.price.toLocaleString()}/mo</div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

        {/* Recent Applications */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-primary-dark mb-6">Recent Applications</h3>
            <Card className="border-primary-lightest">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { name: "Rahul S.", initials: "RS", property: "2BHK Shanti Nagar", time: "2h ago" },
                    { name: "Priya K.", initials: "PK", property: "Rooftop Lazimpat", time: "5h ago" },
                  ].map((app, idx) => (
                    <div key={idx} className="flex items-center gap-4 pb-4 border-b border-primary-lightest last:border-0 last:pb-0">
                      <div className="size-10 rounded-full bg-primary-lightest flex items-center justify-center text-primary-dark font-bold">
                        {app.initials}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{app.name}</p>
                        <p className="text-sm text-muted-foreground">Applied for {app.property}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{app.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
      </div>

      <Footer />
    </div>
  )
}

