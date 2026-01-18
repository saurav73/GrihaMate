import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LandlordLayout } from "@/components/landlord/LandlordLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { propertiesAPI, authAPI, subscriptionAPI, propertyRequestAPI, type PropertyDto, type PropertyRequestDto } from "@/lib/api"
import { toast } from "react-toastify"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Home, Users, Wallet, Clock, Plus, Crown, MessageSquare, Eye, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { PaymentModal } from "@/components/payment/PaymentModal"
import { cn } from "@/lib/utils"

export default function DashboardLandlordPage() {
  const [properties, setProperties] = useState<PropertyDto[]>([])
  const [requests, setRequests] = useState<PropertyRequestDto[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
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
      navigate('/login')
      return
    }

    const fetchData = async () => {
      try {
        const [profile, props, reqs] = await Promise.all([
          authAPI.getProfile(),
          propertiesAPI.getMyProperties(),
          propertyRequestAPI.getLandlordRequests()
        ])
        setUser(profile)
        setProperties(props)
        setRequests(reqs)
      } catch (err: any) {
        console.error("Failed to load dashboard data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  if (!user) return null

  const activeListings = properties.filter(p => p.status === 'AVAILABLE').length
  const pendingApplications = requests.filter(r => r.status === 'PENDING').length

  // Dynamic mocked stats based on real data
  const totalEarnings = requests.filter(r => r.status === 'PAID' || r.status === 'ACCEPTED').length * 15000
  const totalViews = properties.length * 124 // Simple multiplier for effect

  // Dynamic chart data based on properties and requests
  const chartData = [
    { name: 'Mon', views: Math.min(40, properties.length * 10), earnings: requests.length * 1000 },
    { name: 'Tue', views: Math.min(30, properties.length * 15), earnings: requests.length * 1200 },
    { name: 'Wed', views: Math.min(60, properties.length * 20), earnings: requests.length * 1500 },
    { name: 'Thu', views: Math.min(45, properties.length * 12), earnings: requests.length * 1100 },
    { name: 'Fri', views: Math.min(80, properties.length * 25), earnings: requests.length * 1800 },
    { name: 'Sat', views: Math.min(55, properties.length * 18), earnings: requests.length * 1400 },
    { name: 'Sun', views: Math.min(70, properties.length * 22), earnings: requests.length * 1600 },
  ]

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0D2440]">Landlord Dashboard</h1>
          <p className="text-[#2E5E99]">Welcome back, {user.fullName.split(' ')[0]}</p>
        </div>
        <Link to="/dashboard/landlord/list-property">
          <Button className="bg-[#2E5E99] hover:bg-[#1C3860] text-white rounded-full">
            <Plus className="mr-2 size-4" /> Add New Property
          </Button>
        </Link>
      </div>

      {/* Upgrade Banner for FREE users */}
      {user.subscriptionStatus === 'FREE' && (
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Crown className="size-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Upgrade to Premium</h3>
                  <p className="text-sm text-gray-600">List unlimited properties and unlock premium features</p>
                </div>
              </div>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => setPaymentModalOpen(true)}
              >
                <Crown className="mr-2 size-4" />
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Active Listings" value={activeListings} icon={Home} color="text-blue-600" bgColor="bg-blue-50" />
        <StatsCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="text-purple-600" bgColor="bg-purple-50" />
        <StatsCard title="Total Earnings" value={`Rs. ${totalEarnings.toLocaleString()}`} icon={Wallet} color="text-green-600" bgColor="bg-green-50" />
        <StatsCard title="Pending Applications" value={pendingApplications} icon={Clock} color="text-orange-600" bgColor="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-2 border-none shadow-md rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7F0FA" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7BA4D0' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7BA4D0' }} />
                <Tooltip />
                <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="size-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                requests.slice(0, 5).map((req, i) => (
                  <div key={i} className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className={cn(
                      "size-10 rounded-full flex items-center justify-center",
                      req.status === 'PENDING' ? "bg-orange-100 text-orange-600" :
                        req.status === 'ACCEPTED' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {req.status === 'PENDING' ? <Clock className="size-5" /> :
                        req.status === 'ACCEPTED' ? <Home className="size-5" /> : <MessageSquare className="size-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-[#0D2440]">{req.seekerName}</p>
                      <p className="text-xs text-gray-500">{req.status === 'PENDING' ? 'New property request' : `Request ${req.status.toLowerCase()}`} • {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#0D2440] mb-4">Your Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? <p>Loading...</p> : properties.slice(0, 3).map(property => (
            <Card key={property.id} className="border-none shadow-md hover:shadow-lg transition-all overflow-hidden group">
              <div className="h-40 bg-gray-200 relative overflow-hidden">
                <img
                  src={property.imageUrls?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-2 right-2 bg-white text-black hover:bg-white">{property.status}</Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-[#0D2440] truncate">{property.title}</h3>
                <p className="text-sm text-gray-500 mb-2 truncate">{property.address}</p>
                <p className="font-bold text-[#2E5E99]">Rs. {property.price}/mo</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        amount={5000}
        propertyId={0}
        propertyTitle="Premium Subscription"
        onSuccess={async () => {
          try {
            const updatedUser = await subscriptionAPI.upgrade()
            setUser(updatedUser)
            localStorage.setItem('user', JSON.stringify(updatedUser))
            toast.success("Upgraded to Premium successfully!")
            setPaymentModalOpen(false)
          } catch (error: any) {
            toast.error(error.message || "Failed to upgrade")
          }
        }}
        type="subscription"
      />
    </>
  )
}

function StatsCard({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-all rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-[#0D2440]">{value}</h3>
          </div>
          <div className={`p-4 rounded-2xl ${bgColor || 'bg-gray-50'}`}>
            <Icon className={`size-7 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
