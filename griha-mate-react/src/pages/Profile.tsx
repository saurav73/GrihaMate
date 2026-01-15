import { User, Mail, Phone, ShieldCheck, LogOut, LayoutDashboard, Settings } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authAPI } from "@/lib/api"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      toast.error("Please login to view your profile", {
        position: "top-right",
        autoClose: 3000,
      })
      navigate('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (e) {
      toast.error("Invalid session. Please login again", {
        position: "top-right",
        autoClose: 3000,
      })
      navigate('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        const profile = await authAPI.getProfile()
        setUser(profile)
        localStorage.setItem('user', JSON.stringify(profile))
      } catch (err: any) {
        toast.error("Failed to load profile: " + (err.message || "Unknown error"), {
          position: "top-right",
          autoClose: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-primary-lightest flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
        <Footer />
      </div>
    )
  }

  const dashboardPath = user.role === 'SEEKER' ? '/dashboard/seeker' : '/dashboard/landlord'

  return (
    <div className="min-h-screen bg-primary-lightest flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary-lightest">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-lg font-semibold">{user.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="size-4" /> Email
                  </label>
                  <p className="text-lg">{user.email}</p>
                  {user.emailVerified ? (
                    <Badge className="bg-green-500 text-white mt-1">Verified</Badge>
                  ) : (
                    <Badge className="bg-yellow-500 text-white mt-1">Not Verified</Badge>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="size-4" /> Phone Number
                  </label>
                  <p className="text-lg">{user.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                  <p className="text-lg">
                    <Badge className="bg-primary-dark text-white">
                      {user.role === 'SEEKER' ? 'Seeker' : user.role === 'LANDLORD' ? 'Landlord' : 'Admin'}
                    </Badge>
                  </p>
                </div>
                {user.citizenshipNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Citizenship Number</label>
                    <p className="text-lg">{user.citizenshipNumber}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4" /> Verification Status
                  </label>
                  <p className="text-lg">
                    <Badge className={
                      user.verificationStatus === 'VERIFIED' ? 'bg-green-500' :
                      user.verificationStatus === 'PENDING' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }>
                      {user.verificationStatus}
                    </Badge>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="border-primary-lightest">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={dashboardPath}>
                  <Button className="w-full justify-start" variant="outline">
                    <LayoutDashboard className="size-4 mr-2" /> Go to Dashboard
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="size-4 mr-2" /> Settings
                  </Button>
                </Link>
                <Button 
                  className="w-full justify-start text-red-600 hover:text-red-700" 
                  variant="outline"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4 mr-2" /> Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

