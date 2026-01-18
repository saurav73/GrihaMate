import { User, Mail, Phone, ShieldCheck, LayoutDashboard, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authAPI } from "@/lib/api"
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"

export default function LandlordProfilePage() {
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

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  const userInitials = user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'GR'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0D2440]">Profile</h1>
        <p className="text-[#2E5E99]">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0D2440]">
                <User className="size-5" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 pb-4 border-b border-gray-200">
                <Avatar className="h-24 w-24 border-4 border-[#2E5E99]">
                  <AvatarImage src={user?.profileImageUrl} alt={user?.fullName} />
                  <AvatarFallback className="bg-[#2E5E99] text-white text-2xl font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold text-[#0D2440]">{user.fullName}</h3>
                  <p className="text-sm text-gray-500 mt-1">Landlord Account</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg font-semibold text-[#0D2440] mt-1">{user.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Mail className="size-4" /> Email
                </label>
                <p className="text-lg text-[#0D2440] mt-1">{user.email}</p>
                {user.emailVerified ? (
                  <Badge className="bg-green-500 text-white mt-1">Verified</Badge>
                ) : (
                  <Badge className="bg-yellow-500 text-white mt-1">Not Verified</Badge>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Phone className="size-4" /> Phone Number
                </label>
                <p className="text-lg text-[#0D2440] mt-1">{user.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Type</label>
                <p className="text-lg mt-1">
                  <Badge className="bg-[#2E5E99] text-white">
                    {user.role === 'SEEKER' ? 'Seeker' : user.role === 'LANDLORD' ? 'Landlord' : 'Admin'}
                  </Badge>
                </p>
              </div>
              {user.citizenshipNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Citizenship Number</label>
                  <p className="text-lg text-[#0D2440] mt-1">{user.citizenshipNumber}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Subscription Status</label>
                <p className="text-lg mt-1">
                  <Badge className={
                    user.subscriptionStatus === 'PREMIUM' 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }>
                    {user.subscriptionStatus === 'PREMIUM' && <Crown className="size-3 mr-1 inline" />}
                    {user.subscriptionStatus || 'FREE'}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <ShieldCheck className="size-4" /> Verification Status
                </label>
                <p className="text-lg mt-1">
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
          <Card className="border-none shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-[#0D2440]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/dashboard/landlord">
                <Button className="w-full justify-start bg-[#2E5E99] hover:bg-[#1C3860] text-white" variant="default">
                  <LayoutDashboard className="size-4 mr-2" /> Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="border-none shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-[#0D2440]">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-lg text-[#0D2440] mt-1">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

